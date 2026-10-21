import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGeminiAssessment } from './server/gemini.ts';
import { generateDocxBuffer } from './server/exportDocx.ts';
import { generatePdfBuffer } from './server/exportPdf.ts';
import { AssessmentPackage, ExportSection } from './src/types/assessment.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    school: 'SUPM TEGAL',
    appName: 'SUPM TEGAL ASSESMEN MENDALAM',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// Generate Assessment via Gemini 3.8 Flash
app.post('/api/assessments/generate', async (req, res) => {
  try {
    const form = req.body;
    if (!form || !form.subject || !form.materialTopic || !form.learningObjectives) {
      res.status(400).json({
        error: 'VALIDATION_FAILED',
        message: 'Mohon lengkapi data wajib: Mata Pelajaran, Materi/Topik, dan Tujuan Pembelajaran.',
      });
      return;
    }

    const result = await callGeminiAssessment(form);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating assessment:', error);
    const message = error?.message || 'Terjadi kesalahan saat memproses permintaan asesmen.';
    res.status(500).json({
      error: 'GENERATION_ERROR',
      message,
    });
  }
});

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
}

// Export DOCX
app.post('/api/assessments/export/docx', async (req, res) => {
  try {
    const { package: pkg, section } = req.body as { package: AssessmentPackage; section: ExportSection };
    if (!pkg) {
      res.status(400).send('Data perangkat asesmen tidak ditemukan.');
      return;
    }

    const docxBuffer = await generateDocxBuffer(pkg, section || 'all');
    const subjectClean = sanitizeFilename(pkg.metadata?.subject || 'Asesmen');
    const sectionName = section === 'all' ? 'PaketLengkap' : section === 'kisi-kisi' ? 'KisiKisi' : section === 'soal' ? 'NaskahSoal' : section === 'kunci' ? 'KunciJawaban' : 'Rubrik';
    const filename = `SUPM_TEGAL_${sectionName}_${subjectClean}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (error: any) {
    console.error('Error generating DOCX:', error);
    res.status(500).json({ error: 'DOCX_ERROR', message: 'Gagal membuat file DOCX.' });
  }
});

// Export PDF
app.post('/api/assessments/export/pdf', async (req, res) => {
  try {
    const { package: pkg, section } = req.body as { package: AssessmentPackage; section: ExportSection };
    if (!pkg) {
      res.status(400).send('Data perangkat asesmen tidak ditemukan.');
      return;
    }

    const pdfBuffer = await generatePdfBuffer(pkg, section || 'all');
    const subjectClean = sanitizeFilename(pkg.metadata?.subject || 'Asesmen');
    const sectionName = section === 'all' ? 'PaketLengkap' : section === 'kisi-kisi' ? 'KisiKisi' : section === 'soal' ? 'NaskahSoal' : section === 'kunci' ? 'KunciJawaban' : 'Rubrik';
    const filename = `SUPM_TEGAL_${sectionName}_${subjectClean}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'PDF_ERROR', message: 'Gagal membuat file PDF.' });
  }
});

// Mount Vite or serve static dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SUPM Tegal Assessment Generator berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
