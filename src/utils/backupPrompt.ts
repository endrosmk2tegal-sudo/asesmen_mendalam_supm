import { AssessmentFormValues } from '../types/assessment';

export const DEPARTMENT_NAMES: Record<string, string> = {
  NKPI: 'Nautika Kapal Penangkap Ikan (NKPI)',
  TKPI: 'Teknika Kapal Penangkap Ikan (TKPI)',
  APPL: 'Agribisnis Perikanan Air Payau dan Laut (APPL)',
  APHP: 'Agribisnis Pengolahan Hasil Perikanan (APHP)',
};

export function generateAssessmentPrompt(form: AssessmentFormValues): string {
  const deptFull = DEPARTMENT_NAMES[form.department] || form.department;
  const soloLevelsStr = form.soloTaxonomyLevels.length > 0 
    ? form.soloTaxonomyLevels.join(', ')
    : 'Unistruktural, Multistruktural, Relasional';

  return `PERAN & IDENTITAS SISTEM:
Anda adalah Ahli Asesmen Pembelajaran Kejuruan Maritim & Kelautan untuk SUPM TEGAL (Sekolah Usaha Perikanan Menengah Tegal, Kementerian Kelautan dan Perikanan RI).
Tugas Anda adalah menyusun Perangkat Asesmen Lengkap yang otentik, presisi, berbobot kejuruan, dan selaras dengan Standar Kompetensi Kerja / Kurikulum SMK Maritim.

IDENTITAS ASESMEN:
- Satuan Pendidikan: SUPM TEGAL
- Nama Guru Pengampu: ${form.teacherName || 'Guru Pengampu SUPM TEGAL'}
- Mata Pelajaran: ${form.subject}
- Jenjang: SMK
- Tingkat/Kelas: Kelas ${form.gradeClass}
- Jurusan/Program Keahlian: ${deptFull}
- Jenis Asesmen: ${form.assessmentType}
- Bentuk Instrumen: ${form.instrumentType}
- Target Jumlah Butir Soal/Tugas: Tepat ${form.itemCount} butir
- Tingkat Kognitif (Taksonomi SOLO): ${soloLevelsStr}
- Materi/Topik Pembelajaran:
${form.materialTopic}

- Tujuan Pembelajaran:
${form.learningObjectives}
${form.additionalIndicators ? `\n- Capaian Pembelajaran / Indikator Tambahan:\n${form.additionalIndicators}` : ''}
${form.additionalInstructions ? `\n- Instruksi Khusus Guru:\n${form.additionalInstructions}` : ''}

KARAKTERISTIK KHUSUS JENIS ASESMEN (${form.assessmentType.toUpperCase()}):
${
  form.assessmentType === 'Diagnostik'
    ? `- Asesmen Diagnostik bertujuan mengidentifikasi pengetahuan prasyarat, kesiapan peserta didik, dan potensi miskonsepsi dasar materi kemaritiman/perikanan.
- Setiap butir menguji konsep fondasi atau skenario awal.
- Bagian rubrik dan tindak lanjut WAJIB menyajikan interpretasi pemetaan kelompok belajar (perlu intervensi khusus, siap belajar, pengayaan) beserta tindakan diferensiasi pembelajaran.`
    : form.assessmentType === 'Formatif'
    ? `- Asesmen Formatif bertujuan memantau proses pemahaman, memberikan umpan balik korektif yang spesifik, dan memfasilitasi refleksi diri peserta didik.
- Setiap butir memberikan umpan balik langsung pada pembahasan kunci.
- Bagian rubrik memuat saran perbaikan proses belajar dan target perbaikan kompetensi segera.`
    : `- Asesmen Sumatif bertujuan mengukur ketercapaian Tujuan Pembelajaran secara komprehensif, terstandar, dan berbobot.
- Kisi-kisi terpetakan ketat dengan nomor butir dan bobot skor.
- Kunci jawaban memiliki pedoman penskoran baku dan konversi nilai skala 0-100.`
}

ATURAN STRUKTURAL KETAT (WAJIB DIPENUHI):
1. JUMLAH BUTIR SOAL: Harus tepat berjumlah ${form.itemCount} butir (nomor 1 sampai ${form.itemCount}). Jangan kurang atau lebih.
2. JIKA PILIHAN GANDA:
   - Setiap butir WAJIB memiliki tepat 5 pilihan opsi: A, B, C, D, dan E.
   - Tidak boleh hanya ada 4 opsi (A-D). Pastikan opsi E selalu ada.
   - Opsi pengecoh harus logis, realistis dalam dunia kemaritiman/perikanan, dan tidak ambigu.
3. KISI-KISI:
   - Setiap butir dari nomor 1 sampai ${form.itemCount} harus terpetakan pada tabel kisi-kisi dengan indikator soal yang spesifik dan level SOLO yang sesuai.
4. NASKAH SOAL SISWA:
   - Bersih dari kunci jawaban atau tanda apapun yang membocorkan jawaban.
   - Siap dibagikan dan dicetak langsung untuk taruna/taruni SUPM.
5. KUNCI JAWABAN TERPISAH:
   - Memuat nomor butir, kunci jawaban benar, penjelasan/pembahasan ilmiah maritim, dan unsur esensial yang diharapkan.
6. RUBRIK PENSKORAN:
   - Memuat rumus penilaian yang jelas, skor maksimum, kriteria deskriptif, dan interpretasi tindak lanjut bagi pendidik.

FORMAT OUTPUT:
Keluarkan hasil dalam struktur JSON valid tanpa pembungkus teks tambahan di luar JSON agar dapat langsung diproses oleh sistem.`;
}
