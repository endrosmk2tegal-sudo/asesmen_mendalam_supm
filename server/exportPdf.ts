import PDFDocument from 'pdfkit';
import { AssessmentPackage, ExportSection } from '../src/types/assessment.ts';

export function generatePdfBuffer(pkg: AssessmentPackage, section: ExportSection): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 45, right: 45 },
        bufferPages: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => reject(err));

      const includeKisiKisi = section === 'all' || section === 'kisi-kisi';
      const includeSoal = section === 'all' || section === 'soal';
      const includeKunci = section === 'all' || section === 'kunci';
      const includeRubrik = section === 'all' || section === 'rubrik';

      let isFirstSection = true;

      const printKop = (subtitle: string) => {
        if (!isFirstSection) {
          doc.addPage();
        }
        isFirstSection = false;

        // Header Title
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1E3A8A').text('KEMENTERIAN KELAUTAN DAN PERIKANAN', { align: 'center' });
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#0F2B5C').text('SEKOLAH USAHA PERIKANAN MENENGAH (SUPM) TEGAL', { align: 'center' });
        doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#4B5563').text('Jl. Martoloyo PO BOX 22 Tegal 52111 | Telp/Fax: (0283) 356246', { align: 'center' });
        
        // Double Divider Line
        const y = doc.y + 4;
        doc.strokeColor('#0F2B5C').lineWidth(2).moveTo(45, y).lineTo(550, y).stroke();
        doc.strokeColor('#1E3A8A').lineWidth(0.5).moveTo(45, y + 3).lineTo(550, y + 3).stroke();
        doc.moveDown(0.8);

        // Section Subtitle
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F2B5C').text(`PERANGKAT ASESMEN ${pkg.metadata.assessmentType.toUpperCase()} - ${subtitle.toUpperCase()}`, { align: 'center' });
        doc.moveDown(0.6);

        // Metadata Box
        const startY = doc.y;
        doc.rect(45, startY, 505, 52).fillAndStroke('#F8FAFC', '#CBD5E1');
        doc.fillColor('#0F172A').fontSize(8.5);

        // Left Col
        doc.font('Helvetica-Bold').text('Mata Pelajaran', 52, startY + 6, { width: 85, continued: false });
        doc.font('Helvetica').text(`: ${pkg.metadata.subject}`, 135, startY + 6, { width: 140, continued: false });

        doc.font('Helvetica-Bold').text('Program Keahlian', 52, startY + 20, { width: 85, continued: false });
        doc.font('Helvetica').text(`: ${pkg.metadata.department} (${pkg.metadata.departmentFullName || ''})`, 135, startY + 20, { width: 140, continued: false });

        doc.font('Helvetica-Bold').text('Guru Pengampu', 52, startY + 34, { width: 85, continued: false });
        doc.font('Helvetica').text(`: ${pkg.metadata.teacherName || 'Guru SUPM Tegal'}`, 135, startY + 34, { width: 140, continued: false });

        // Right Col
        doc.font('Helvetica-Bold').text('Kelas / Semester', 290, startY + 6, { width: 85, continued: false });
        doc.font('Helvetica').text(`: Kelas ${pkg.metadata.gradeClass} (SMK)`, 375, startY + 6, { width: 165, continued: false });

        doc.font('Helvetica-Bold').text('Bentuk Instrumen', 290, startY + 20, { width: 85, continued: false });
        doc.font('Helvetica').text(`: ${pkg.metadata.instrumentType} (${pkg.metadata.itemCount} Butir)`, 375, startY + 20, { width: 165, continued: false });

        doc.font('Helvetica-Bold').text('Tanggal Asesmen', 290, startY + 34, { width: 85, continued: false });
        doc.font('Helvetica').text(`: ${pkg.metadata.date}`, 375, startY + 34, { width: 165, continued: false });

        doc.y = startY + 62;
      };

      // 1. KISI-KISI
      if (includeKisiKisi) {
        printKop('KISI-KISI ASESMEN');
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F2B5C').text('TABEL PEMETAAN KISI-KISI SOAL:');
        doc.moveDown(0.4);

        // Simple readable table
        (pkg.kisiKisi || []).forEach((k, idx) => {
          if (doc.y > 700) doc.addPage();
          const itemY = doc.y;
          doc.rect(45, itemY, 505, 48).fillAndStroke(idx % 2 === 0 ? '#FFFFFF' : '#F1F5F9', '#E2E8F0');
          doc.fillColor('#0F172A').fontSize(8);

          doc.font('Helvetica-Bold').text(`No. ${k.number || idx + 1} | Butir ${k.itemNumber} | Level SOLO: ${k.soloLevel} | Skor: ${k.weightScore}`, 52, itemY + 4);
          doc.font('Helvetica-Bold').text('Tujuan: ', 52, itemY + 16, { continued: true }).font('Helvetica').text(k.learningObjective || '-', { width: 490 });
          doc.font('Helvetica-Bold').text('Indikator: ', 52, itemY + 28, { continued: true }).font('Helvetica').text(k.indicator || '-', { width: 490 });
          doc.y = itemY + 52;
        });
      }

      // 2. NASKAH SOAL (NO ANSWER KEYS)
      if (includeSoal) {
        printKop('LEMBAR NASKAH SOAL');

        doc.rect(45, doc.y, 505, 32).fillAndStroke('#FEF3C7', '#FDE68A');
        doc.fillColor('#92400E').fontSize(8).font('Helvetica-Bold').text('PETUNJUK PENGERJAAN SISWA:', 52, doc.y + 4);
        doc.font('Helvetica').text('1. Bacalah basmalah dan periksa butir soal sebelum menjawab. 2. Kerjakan pada lembar jawaban yang tersedia. 3. Dahulukan soal yang paling Anda kuasai.', 52, doc.y + 14, { width: 490 });
        doc.y += 24;
        doc.moveDown(0.8);

        (pkg.questions || []).forEach((q) => {
          if (doc.y > 690) doc.addPage();

          // Stimulus
          if (q.stimulus) {
            doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E3A8A').text(`[Wacana/Stimulus Butir ${q.number}]`, 45, doc.y);
            doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#334155').text(q.stimulus, 45, doc.y, { width: 505 });
            doc.moveDown(0.3);
          }

          // Question Text
          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F172A').text(`${q.number}. `, 45, doc.y, { continued: true });
          doc.font('Helvetica').text(q.questionText, { width: 485 });
          doc.moveDown(0.3);

          // Options A-E
          if (q.options && q.options.length > 0) {
            q.options.forEach((opt) => {
              if (doc.y > 720) doc.addPage();
              doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E293B').text(`   ${opt.key}. `, 55, doc.y, { continued: true });
              doc.font('Helvetica').text(opt.text, { width: 470 });
              doc.moveDown(0.15);
            });
          }

          // Instructions if essay
          if (q.instructions) {
            doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748B').text(`   Instruksi: ${q.instructions}`, 55, doc.y, { width: 470 });
            doc.moveDown(0.2);
          }

          doc.moveDown(0.5);
        });
      }

      // 3. KUNCI JAWABAN (TERPISAH)
      if (includeKunci) {
        printKop('KUNCI JAWABAN & PEMBAHASAN');

        doc.rect(45, doc.y, 505, 20).fillAndStroke('#FEE2E2', '#FECACA');
        doc.fillColor('#991B1B').fontSize(8.5).font('Helvetica-Bold').text('*DOKUMEN RAHASIA PEGANGAN GURU & TIM PENGUJI SUPM*', 52, doc.y + 5);
        doc.y += 18;
        doc.moveDown(0.6);

        (pkg.answerKeys || []).forEach((ak) => {
          if (doc.y > 690) doc.addPage();

          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F2B5C').text(`Butir ${ak.number}. Kunci Jawaban: `, 45, doc.y, { continued: true });
          doc.fillColor('#15803D').text(`${ak.correctAnswer} ${ak.fullAnswerText ? `- ${ak.fullAnswerText}` : ''}`);
          doc.moveDown(0.2);

          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E3A8A').text('Pembahasan Ilmiah & Teknis:', 55, doc.y);
          doc.font('Helvetica').fillColor('#334155').text(ak.explanation, 55, doc.y, { width: 490 });
          doc.moveDown(0.2);

          if (ak.expectedElements && ak.expectedElements.length > 0) {
            doc.font('Helvetica-Bold').fillColor('#475569').text('Unsur Kunci Jawaban:', 55, doc.y);
            ak.expectedElements.forEach((el) => {
              doc.font('Helvetica').fillColor('#475569').text(` • ${el}`, 65, doc.y, { width: 480 });
            });
          }

          doc.moveDown(0.6);
        });
      }

      // 4. RUBRIK & PENSKORAN
      if (includeRubrik) {
        printKop('RUBRIK & PEDOMAN PENSKORAN');

        if (pkg.rubric) {
          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F2B5C').text('Ringkasan Pedoman Penilaian:');
          doc.fontSize(8.5).font('Helvetica').fillColor('#334155').text(pkg.rubric.instrumentSummary || 'Asesmen pembelajaran vokasi maritim.');
          doc.moveDown(0.4);

          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F2B5C').text('Rumus Nilai Akhir:');
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E3A8A').text(pkg.rubric.scoringFormula || 'Nilai = (Skor Perolehan / Total Skor Maksimal) x 100');
          doc.moveDown(0.4);

          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F2B5C').text('Kriteria Ketuntasan Tujuan Pembelajaran (KKTP):');
          doc.fontSize(8.5).font('Helvetica').fillColor('#334155').text(pkg.rubric.passingGradeAdvice || 'KKTP = 75.');
          doc.moveDown(0.8);

          if (pkg.rubric.criteria && pkg.rubric.criteria.length > 0) {
            doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F2B5C').text('Kriteria & Skala Penilaian:');
            pkg.rubric.criteria.forEach((crit) => {
              if (doc.y > 690) doc.addPage();
              doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E293B').text(`• Aspek: ${crit.aspect} (Bobot: ${crit.weight}%)`, 50, doc.y);
              crit.levels.forEach((lvl) => {
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text(`   [${lvl.level} - Skor ${lvl.score}]: `, 55, doc.y, { continued: true });
                doc.font('Helvetica').fillColor('#334155').text(lvl.description, { width: 475 });
              });
              doc.moveDown(0.3);
            });
            doc.moveDown(0.5);
          }

          if (pkg.rubric.followUpRecommendations && pkg.rubric.followUpRecommendations.length > 0) {
            doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0F2B5C').text('Rekomendasi Tindak Lanjut Hasil Asesmen:');
            pkg.rubric.followUpRecommendations.forEach((rec) => {
              if (doc.y > 720) doc.addPage();
              doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E3A8A').text(`• ${rec.category}: `, 50, doc.y, { continued: true });
              doc.font('Helvetica').fillColor('#334155').text(rec.action, { width: 480 });
              doc.moveDown(0.2);
            });
          }
        }
      }

      // Lembar Pengesahan
      if (doc.y > 660) doc.addPage();
      doc.moveDown(1.5);
      const signY = doc.y;

      doc.fontSize(8.5).font('Helvetica').fillColor('#0F172A');
      doc.text('Mengetahui,\nKepala / Waka Kurikulum SUPM Tegal', 60, signY);
      doc.text(`Tegal, ${pkg.metadata.date}\nGuru Pengampu Mata Pelajaran,`, 340, signY);

      doc.text('_______________________________', 60, signY + 55);
      doc.text('NIP. .................................................', 60, signY + 68);

      doc.font('Helvetica-Bold').text(pkg.metadata.teacherName || 'Guru SUPM Tegal', 340, signY + 55);
      doc.font('Helvetica').text('NIP. .................................................', 340, signY + 68);

      // Add page numbers
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8')
          .text(`Halaman ${i + 1} dari ${range.count} | SUPM TEGAL Assessment System`, 45, 800, { align: 'center', width: 505 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
