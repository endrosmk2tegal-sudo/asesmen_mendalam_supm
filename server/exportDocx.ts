import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  PageBreak,
} from 'docx';
import { AssessmentPackage, ExportSection } from '../src/types/assessment.ts';

const BORDER_STYLE = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
};

function createHeaderTable(pkg: AssessmentPackage, subtitle: string): Table {
  const meta = pkg.metadata;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: '0F2B5C' },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'KEMENTERIAN KELAUTAN DAN PERIKANAN',
                    font: 'Calibri',
                    size: 22,
                    bold: true,
                    color: '1E3A8A',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'SEKOLAH USAHA PERIKANAN MENENGAH (SUPM) TEGAL',
                    font: 'Calibri',
                    size: 26,
                    bold: true,
                    color: '0F2B5C',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Jl. Martoloyo PO BOX 22 Tegal 52111, Jawa Tengah | Telp/Fax: (0283) 356246',
                    font: 'Calibri',
                    size: 16,
                    italics: true,
                    color: '4B5563',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120, after: 60 },
                children: [
                  new TextRun({
                    text: `PERANGKAT ASESMEN ${meta.assessmentType.toUpperCase()} - ${subtitle.toUpperCase()}`,
                    font: 'Calibri',
                    size: 22,
                    bold: true,
                    color: '0F2B5C',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createMetaTable(pkg: AssessmentPackage): Table {
  const meta = pkg.metadata;
  const row = (label1: string, val1: string, label2: string, val2: string) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: [new Paragraph({ children: [new TextRun({ text: label1, bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: [new Paragraph({ children: [new TextRun({ text: `: ${val1}`, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: [new Paragraph({ children: [new TextRun({ text: label2, bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: [new Paragraph({ children: [new TextRun({ text: `: ${val2}`, size: 18 })] })],
        }),
      ],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    rows: [
      row('Mata Pelajaran', meta.subject, 'Kelas / Semester', `Kelas ${meta.gradeClass} (SMK)`),
      row('Program Keahlian', `${meta.department} (${meta.departmentFullName || ''})`, 'Bentuk Instrumen', meta.instrumentType),
      row('Guru Pengampu', meta.teacherName || 'Guru SUPM Tegal', 'Jumlah Butir', `${meta.itemCount} Butir`),
      row('Jenis Asesmen', meta.assessmentType, 'Tanggal Pembuatan', meta.date),
    ],
  });
}

export async function generateDocxBuffer(pkg: AssessmentPackage, section: ExportSection): Promise<Buffer> {
  const children: any[] = [];

  const includeKisiKisi = section === 'all' || section === 'kisi-kisi';
  const includeSoal = section === 'all' || section === 'soal';
  const includeKunci = section === 'all' || section === 'kunci';
  const includeRubrik = section === 'all' || section === 'rubrik';

  // Section 1: Kisi-Kisi
  if (includeKisiKisi) {
    children.push(createHeaderTable(pkg, 'KISI-KISI ASESMEN'));
    children.push(new Paragraph({ spacing: { before: 100, after: 100 } }));
    children.push(createMetaTable(pkg));
    children.push(new Paragraph({ spacing: { before: 150, after: 80 } }));

    // Kisi-Kisi Table
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 5, type: WidthType.PERCENTAGE },
          shading: { fill: '0F2B5C' },
          borders: BORDER_STYLE,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF', size: 16 })] })],
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: '0F2B5C' },
          borders: BORDER_STYLE,
          children: [new Paragraph({ children: [new TextRun({ text: 'Tujuan Pembelajaran', bold: true, color: 'FFFFFF', size: 16 })] })],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '0F2B5C' },
          borders: BORDER_STYLE,
          children: [new Paragraph({ children: [new TextRun({ text: 'Materi Pokok', bold: true, color: 'FFFFFF', size: 16 })] })],
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: '0F2B5C' },
          borders: BORDER_STYLE,
          children: [new Paragraph({ children: [new TextRun({ text: 'Indikator Soal/Tugas', bold: true, color: 'FFFFFF', size: 16 })] })],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: '0F2B5C' },
          borders: BORDER_STYLE,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Level SOLO', bold: true, color: 'FFFFFF', size: 16 })] })],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          shading: { fill: '0F2B5C' },
          borders: BORDER_STYLE,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No. Butir', bold: true, color: 'FFFFFF', size: 16 })] })],
        }),
        new TableCell({
          width: { size: 5, type: WidthType.PERCENTAGE },
          shading: { fill: '0F2B5C' },
          borders: BORDER_STYLE,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Skor', bold: true, color: 'FFFFFF', size: 16 })] })],
        }),
      ],
    });

    const rows = [headerRow];
    (pkg.kisiKisi || []).forEach((item, idx) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), size: 16 })] })] }),
            new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ children: [new TextRun({ text: item.learningObjective || '-', size: 16 })] })] }),
            new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ children: [new TextRun({ text: item.topic || '-', size: 16 })] })] }),
            new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ children: [new TextRun({ text: item.indicator || '-', size: 16 })] })] }),
            new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.soloLevel || '-', size: 16, bold: true })] })] }),
            new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(item.itemNumber || idx + 1), size: 16 })] })] }),
            new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(item.weightScore || 1), size: 16 })] })] }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
  }

  // Section 2: Naskah Soal (Siap Cetak untuk Siswa - NO ANSWER KEYS!)
  if (includeSoal) {
    if (includeKisiKisi) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    children.push(createHeaderTable(pkg, 'LEMBAR NASKAH SOAL'));
    children.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
    children.push(createMetaTable(pkg));
    children.push(new Paragraph({ spacing: { before: 120, after: 60 } }));

    // Petunjuk Pengerjaan
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: 'PETUNJUK UMUM PENGERJAAN:', bold: true, size: 18, color: '0F2B5C' })],
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '1. Berdoalah sebelum mulai mengerjakan soal.\n2. Tuliskan Nama, NISN/No. Ujian, dan Kelas pada lembar jawaban yang telah disediakan.\n3. Periksa dan bacalah setiap butir soal dengan teliti sebelum menjawab.\n4. Dahulukan soal-soal yang Anda anggap mudah.',
            size: 16,
            italics: true,
          }),
        ],
        spacing: { after: 120 },
      })
    );

    // Questions list
    (pkg.questions || []).forEach((q) => {
      // Stimulus if available
      if (q.stimulus) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({ text: `[Wacana/Stimulus Butir ${q.number}]: `, bold: true, size: 16, color: '1E3A8A' }),
              new TextRun({ text: q.stimulus, italics: true, size: 16 }),
            ],
          })
        );
      }

      // Question body
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: `${q.number}. `, bold: true, size: 18 }),
            new TextRun({ text: q.questionText, size: 18 }),
          ],
        })
      );

      // Options if Multiple Choice (A-E)
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt) => {
          children.push(
            new Paragraph({
              indent: { left: 400 },
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({ text: `${opt.key}. `, bold: true, size: 17 }),
                new TextRun({ text: opt.text, size: 17 }),
              ],
            })
          );
        });
      }

      // Instructions if essay/practice
      if (q.instructions) {
        children.push(
          new Paragraph({
            indent: { left: 400 },
            spacing: { before: 30, after: 30 },
            children: [
              new TextRun({ text: 'Instruksi Pengerjaan: ', bold: true, size: 16, color: '4B5563' }),
              new TextRun({ text: q.instructions, size: 16 }),
            ],
          })
        );
      }

      children.push(new Paragraph({ spacing: { after: 80 } }));
    });
  }

  // Section 3: Kunci Jawaban & Pembahasan (Terpisah di halaman baru)
  if (includeKunci) {
    if (includeKisiKisi || includeSoal) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    children.push(createHeaderTable(pkg, 'KUNCI JAWABAN & PEMBAHASAN'));
    children.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
    children.push(createMetaTable(pkg));
    children.push(new Paragraph({ spacing: { before: 120, after: 60 } }));

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '*DOKUMEN RAHASIA GURU & PENILAI - DILARANG DIBAGIKAN KEPADA PESERTA DIDIK*',
            bold: true,
            size: 16,
            color: 'DC2626',
          }),
        ],
        spacing: { after: 100 },
      })
    );

    (pkg.answerKeys || []).forEach((ak) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({ text: `Nomor ${ak.number}. Kunci Jawaban: `, bold: true, size: 18, color: '0F2B5C' }),
            new TextRun({ text: `${ak.correctAnswer} ${ak.fullAnswerText ? `- ${ak.fullAnswerText}` : ''}`, bold: true, size: 18, color: '15803D' }),
          ],
        })
      );

      children.push(
        new Paragraph({
          indent: { left: 300 },
          spacing: { before: 20, after: 40 },
          children: [
            new TextRun({ text: 'Pembahasan Ilmiah & Teknis: ', bold: true, size: 16, color: '1E3A8A' }),
            new TextRun({ text: ak.explanation, size: 16 }),
          ],
        })
      );

      if (ak.expectedElements && ak.expectedElements.length > 0) {
        children.push(
          new Paragraph({
            indent: { left: 300 },
            spacing: { before: 20, after: 60 },
            children: [
              new TextRun({ text: 'Unsur Esensial Kinerja/Jawaban:\n', bold: true, size: 15, color: '4B5563' }),
              new TextRun({ text: ak.expectedElements.map((el, i) => ` • ${el}`).join('\n'), size: 15 }),
            ],
          })
        );
      }
    });
  }

  // Section 4: Rubrik & Pedoman Penskoran
  if (includeRubrik) {
    if (includeKisiKisi || includeSoal || includeKunci) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    children.push(createHeaderTable(pkg, 'RUBRIK & PEDOMAN PENSKORAN'));
    children.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
    children.push(createMetaTable(pkg));
    children.push(new Paragraph({ spacing: { before: 120, after: 60 } }));

    if (pkg.rubric) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Ringkasan & Karakteristik Instrumen:\n', bold: true, size: 17, color: '0F2B5C' }),
            new TextRun({ text: pkg.rubric.instrumentSummary || 'Asesmen berbasis Taksonomi SOLO dan standar vokasi maritim.', size: 16 }),
          ],
          spacing: { after: 60 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Rumus Konversi Nilai Akhir:\n', bold: true, size: 17, color: '0F2B5C' }),
            new TextRun({ text: pkg.rubric.scoringFormula || 'Nilai = (Total Skor Perolehan / Total Skor Maksimal) x 100', bold: true, size: 17, color: '1E3A8A' }),
          ],
          spacing: { after: 60 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Kriteria Ketuntasan Tujuan Pembelajaran (KKTP):\n', bold: true, size: 17, color: '0F2B5C' }),
            new TextRun({ text: pkg.rubric.passingGradeAdvice || 'Nilai minimal ketuntasan 75 (skala 100).', size: 16 }),
          ],
          spacing: { after: 100 },
        })
      );

      // Criteria table if exists
      if (pkg.rubric.criteria && pkg.rubric.criteria.length > 0) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: 'KRITERIA & DESKRIPTOR PENILAIAN:', bold: true, size: 18, color: '0F2B5C' })],
            spacing: { after: 60 },
          })
        );

        const rubricHeader = new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: '0F2B5C' }, borders: BORDER_STYLE, children: [new Paragraph({ children: [new TextRun({ text: 'Aspek Penilaian', bold: true, color: 'FFFFFF', size: 16 })] })] }),
            new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: '0F2B5C' }, borders: BORDER_STYLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bobot', bold: true, color: 'FFFFFF', size: 16 })] })] }),
            new TableCell({ width: { size: 65, type: WidthType.PERCENTAGE }, shading: { fill: '0F2B5C' }, borders: BORDER_STYLE, children: [new Paragraph({ children: [new TextRun({ text: 'Deskriptor Kualitas Pencapaian', bold: true, color: 'FFFFFF', size: 16 })] })] }),
          ],
        });

        const rRows = [rubricHeader];
        pkg.rubric.criteria.forEach((crit) => {
          const desc = crit.levels.map((l) => `[${l.level} - Skor ${l.score}]: ${l.description}`).join('\n\n');
          rRows.push(
            new TableRow({
              children: [
                new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ children: [new TextRun({ text: crit.aspect, bold: true, size: 16 })] })] }),
                new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${crit.weight}%`, size: 16 })] })] }),
                new TableCell({ borders: BORDER_STYLE, children: [new Paragraph({ children: [new TextRun({ text: desc, size: 15 })] })] }),
              ],
            })
          );
        });

        children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rRows }));
        children.push(new Paragraph({ spacing: { after: 100 } }));
      }

      // Recommendations
      if (pkg.rubric.followUpRecommendations && pkg.rubric.followUpRecommendations.length > 0) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: 'PANDUAN TINDAK LANJUT HASIL ASESMEN:', bold: true, size: 18, color: '0F2B5C' })],
            spacing: { before: 80, after: 60 },
          })
        );

        pkg.rubric.followUpRecommendations.forEach((rec) => {
          children.push(
            new Paragraph({
              spacing: { before: 30, after: 30 },
              children: [
                new TextRun({ text: `• ${rec.category}: `, bold: true, size: 16, color: '1E3A8A' }),
                new TextRun({ text: rec.action, size: 16 }),
              ],
            })
          );
        });
      }
    }
  }

  // Quality verification signature line
  children.push(new Paragraph({ spacing: { before: 200, after: 50 } }));
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Mengetahui,\nKepala / Waka Kurikulum SUPM Tegal', size: 16 })] }),
                new Paragraph({ spacing: { before: 400 } }),
                new Paragraph({ children: [new TextRun({ text: '_______________________________', bold: true, size: 16 })] }),
                new Paragraph({ children: [new TextRun({ text: 'NIP. .................................................', size: 15 })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ children: [new TextRun({ text: `Tegal, ${pkg.metadata.date}\nGuru Pengampu Mata Pelajaran,`, size: 16 })] }),
                new Paragraph({ spacing: { before: 400 } }),
                new Paragraph({ children: [new TextRun({ text: pkg.metadata.teacherName || 'Guru SUPM Tegal', bold: true, size: 16 })] }),
                new Paragraph({ children: [new TextRun({ text: 'NIP. .................................................', size: 15 })] }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
