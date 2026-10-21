import React, { useState } from 'react';
import {
  AssessmentFormValues,
  DepartmentCode,
  AssessmentType,
  InstrumentType,
  SoloLevel,
} from '../types/assessment';
import { DEPARTMENT_NAMES } from '../utils/backupPrompt';
import {
  BookOpen,
  Sparkles,
  Layers,
  Sliders,
  FileCode,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Ship,
  Wrench,
  Fish,
  UtensilsCrossed,
} from 'lucide-react';

interface AssessmentFormProps {
  initialValues: AssessmentFormValues;
  onSubmit: (values: AssessmentFormValues) => void;
  onOpenManualPrompt: (values: AssessmentFormValues) => void;
  isLoading: boolean;
}

const SOLO_LEVELS: { id: SoloLevel; label: string; desc: string }[] = [
  { id: 'Prastruktural', label: 'Prastruktural', desc: 'Informasi awal / parsial tanpa keterkaitan logis' },
  { id: 'Unistruktural', label: 'Unistruktural', desc: 'Fokus pada satu aspek atau konsep konkret' },
  { id: 'Multistruktural', label: 'Multistruktural', desc: 'Memahami beberapa aspek terpisah secara faktual' },
  { id: 'Relasional', label: 'Relasional', desc: 'Mengintegrasikan konsep, menganalisis hubungan sebab-akibat' },
  { id: 'Abstrak Diperluas', label: 'Abstrak Diperluas', desc: 'Generalisasi konsep ke domain/skenario baru & evaluasi' },
];

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialValues,
  onSubmit,
  onOpenManualPrompt,
  isLoading,
}) => {
  const [form, setForm] = useState<AssessmentFormValues>(initialValues);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (field: keyof AssessmentFormValues, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSoloToggle = (level: SoloLevel) => {
    setForm((prev) => {
      const exists = prev.soloTaxonomyLevels.includes(level);
      const updated = exists
        ? prev.soloTaxonomyLevels.filter((l) => l !== level)
        : [...prev.soloTaxonomyLevels, level];
      return {
        ...prev,
        soloTaxonomyLevels: updated.length > 0 ? updated : ['Unistruktural'],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) {
      setErrorMsg('Mata Pelajaran wajib diisi.');
      return;
    }
    if (!form.materialTopic.trim()) {
      setErrorMsg('Materi / Topik Pembelajaran wajib diisi.');
      return;
    }
    if (!form.learningObjectives.trim()) {
      setErrorMsg('Tujuan Pembelajaran wajib diisi.');
      return;
    }
    setErrorMsg(null);
    onSubmit(form);
  };

  const loadPreset = (preset: Partial<AssessmentFormValues>) => {
    setForm((prev) => ({
      ...prev,
      ...preset,
    }));
    setErrorMsg(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Form Title Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            Parameter Perangkat Asesmen
          </h2>
          <p className="text-xs text-blue-200">
            Lengkapi formulir di bawah ini untuk menghasilkan Kisi-Kisi, Soal, Kunci, dan Rubrik secara otomatis dengan Gemini AI.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-blue-300 font-medium mr-1 text-[11px]">Contoh Preset Cepat:</span>
          <button
            type="button"
            onClick={() =>
              loadPreset({
                department: 'NKPI',
                subject: 'Navigasi Datar & Peta Laut',
                gradeClass: 'XI',
                assessmentType: 'Sumatif',
                instrumentType: 'Pilihan Ganda',
                itemCount: 10,
                materialTopic: 'Penentuan Posisi Kapal dengan Baringan Silang dan Penggunaan Kompas Magnet',
                learningObjectives: 'Peserta didik mampu menghitung variasi, deviasi, sembiring kompas, dan memplotkan garis baringan pada peta laut dengan tingkat akurasi sesuai standar IMO.',
                soloTaxonomyLevels: ['Multistruktural', 'Relasional'],
              })
            }
            className="px-2.5 py-1 bg-blue-800/80 hover:bg-blue-700 text-blue-100 rounded-md border border-blue-600 transition flex items-center gap-1"
          >
            <Ship className="w-3 h-3 text-amber-300" /> NKPI
          </button>
          <button
            type="button"
            onClick={() =>
              loadPreset({
                department: 'TKPI',
                subject: 'Mesin Penggerak Utama Kapal',
                gradeClass: 'XII',
                assessmentType: 'Formatif',
                instrumentType: 'Campuran',
                itemCount: 10,
                materialTopic: 'Sistem Injeksi Bahan Bakar Diesel Kapal & Troubleshooting Tekanan Minyak Pelumas',
                learningObjectives: 'Peserta didik mampu mendiagnosis gangguan suplai bahan bakar pada injektor mesin induk dan merumuskan langkah perawatan sistem pelumasan saat pelayaran.',
                soloTaxonomyLevels: ['Unistruktural', 'Multistruktural', 'Relasional'],
              })
            }
            className="px-2.5 py-1 bg-cyan-800/80 hover:bg-cyan-700 text-cyan-100 rounded-md border border-cyan-600 transition flex items-center gap-1"
          >
            <Wrench className="w-3 h-3 text-cyan-300" /> TKPI
          </button>
          <button
            type="button"
            onClick={() =>
              loadPreset({
                department: 'APPL',
                subject: 'Teknik Pembesaran Udang Vaname',
                gradeClass: 'XI',
                assessmentType: 'Diagnostik',
                instrumentType: 'Pilihan Ganda',
                itemCount: 5,
                materialTopic: 'Parameter Kualitas Air Tambak (DO, Salinitas, pH, Alkalinitas, dan Nitrit)',
                learningObjectives: 'Mengidentifikasi pemahaman awal peserta didik mengenai batas toleransi fisika-kimia air tambak dan mitigasi penurunan oksigen terlarut pada malam hari.',
                soloTaxonomyLevels: ['Prastruktural', 'Unistruktural', 'Multistruktural'],
              })
            }
            className="px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-md border border-emerald-600 transition flex items-center gap-1"
          >
            <Fish className="w-3 h-3 text-emerald-300" /> APPL
          </button>
          <button
            type="button"
            onClick={() =>
              loadPreset({
                department: 'APHP',
                subject: 'Pengendalian Mutu Hasil Perikanan',
                gradeClass: 'XII',
                assessmentType: 'Sumatif',
                instrumentType: 'Pilihan Ganda',
                itemCount: 10,
                materialTopic: 'Penerapan Sistem HACCP dan Titik Kendali Kritis (CCP) pada Pembekuan Tuna Loin',
                learningObjectives: 'Peserta didik mampu menganalisis 7 prinsip HACCP, mengidentifikasi CCP bahaya biologis Histamin, serta menetapkan batas kritis suhu penyimpanan beku ikan.',
                soloTaxonomyLevels: ['Relasional', 'Abstrak Diperluas'],
              })
            }
            className="px-2.5 py-1 bg-amber-800/80 hover:bg-amber-700 text-amber-100 rounded-md border border-amber-600 transition flex items-center gap-1"
          >
            <UtensilsCrossed className="w-3 h-3 text-amber-300" /> APHP
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Validasi Formulir:</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* SECTION 1: IDENTITAS GURU & SEKOLAH */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-base">Identitas Guru & Satuan Pendidikan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nama Sekolah (Fixed / Readonly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah <span className="text-slate-400 font-normal">(Otomatis/Tetap)</span>
              </label>
              <input
                type="text"
                value="SUPM TEGAL"
                disabled
                className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            {/* Nama Guru */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Guru Pengampu <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={form.teacherName}
                onChange={(e) => handleChange('teacherName', e.target.value)}
                placeholder="Contoh: Endro Purnomo, S.St.Pi"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Contoh: Navigasi Radar, Biologi Laut, dll."
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Jenjang */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenjang <span className="text-slate-400 font-normal">(Tetap)</span>
              </label>
              <input
                type="text"
                value="SMK"
                disabled
                className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            {/* Tingkat / Kelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={form.gradeClass}
                onChange={(e) => handleChange('gradeClass', e.target.value as 'X' | 'XI' | 'XII')}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
              >
                <option value="X">Kelas X (Fase E)</option>
                <option value="XI">Kelas XI (Fase F)</option>
                <option value="XII">Kelas XII (Fase F Tingkat Lanjut)</option>
              </select>
            </div>

            {/* Jurusan / Program Keahlian */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Keahlian / Jurusan <span className="text-red-500">*</span>
              </label>
              <select
                value={form.department}
                onChange={(e) => handleChange('department', e.target.value as DepartmentCode)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-semibold text-blue-900"
              >
                <option value="NKPI">NKPI - Nautika Kapal Penangkap Ikan</option>
                <option value="TKPI">TKPI - Teknika Kapal Penangkap Ikan</option>
                <option value="APPL">APPL - Agribisnis Perikanan Air Payau & Laut</option>
                <option value="APHP">APHP - Agribisnis Pengolahan Hasil Perikanan</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: RANCANGAN & KARAKTERISTIK ASESMEN */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-base">Rancangan Asesmen Pembelajaran</h3>
          </div>

          {/* Jenis Asesmen Selector with educational logic card */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Jenis Asesmen <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['Diagnostik', 'Formatif', 'Sumatif'] as AssessmentType[]).map((type) => {
                const isSelected = form.assessmentType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChange('assessmentType', type)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {type}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {type === 'Diagnostik' &&
                        'Identifikasi pengetahuan awal, kesiapan belajar, prasyarat maritim, dan mitigasi miskonsepsi.'}
                      {type === 'Formatif' &&
                        'Memantau perkembangan belajar, umpan balik korektif terarah, dan rekomendasi perbaikan.'}
                      {type === 'Sumatif' &&
                        'Pengukuran ketercapaian tujuan belajar komprehensif, kisi-kisi formal, kunci, dan skor 0-100.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Materi / Topik */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Materi / Topik Pokok Pembelajaran <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={form.materialTopic}
              onChange={(e) => handleChange('materialTopic', e.target.value)}
              placeholder="Jelaskan pokok bahasan, misal: Aturan COLREG 1972 dalam situasi bersilangan (Crossing Situation) dan tindakan pencegahan tubrukan di laut..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          {/* Tujuan Pembelajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tujuan Pembelajaran (TP) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={form.learningObjectives}
              onChange={(e) => handleChange('learningObjectives', e.target.value)}
              placeholder="Contoh: Taruna mampu mengidentifikasi status kapal dan menentukan tindakan manuver pencegahan tubrukan sesuai Aturan 15 dan 16 COLREG 1972..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>

          {/* Capaian Pembelajaran / Indikator Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Capaian Pembelajaran (CP) atau Indikator Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              rows={2}
              value={form.additionalIndicators}
              onChange={(e) => handleChange('additionalIndicators', e.target.value)}
              placeholder="Tuliskan elemen CP, standar SKKNI, atau rujukan STCW-F 1995 jika ada..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* SECTION 3: PENGATURAN OUTPUT & TAKSONOMI SOLO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-base">Pengaturan Output & Taksonomi Kognitif</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bentuk Instrumen */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bentuk Instrumen <span className="text-red-500">*</span>
              </label>
              <select
                value={form.instrumentType}
                onChange={(e) => handleChange('instrumentType', e.target.value as InstrumentType)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-medium"
              >
                <option value="Pilihan Ganda">Pilihan Ganda (Tepat 5 Opsi A, B, C, D, E)</option>
                <option value="Esai/Uraian">Esai / Uraian Terstruktur</option>
                <option value="Praktik/Unjuk Kerja">Praktik / Unjuk Kerja Kejuruan (Vokasi)</option>
                <option value="Observasi">Observasi / Lembar Pengamatan Sikap & Kinerja</option>
                <option value="Campuran">Campuran (Pilihan Ganda + Esai Analisis)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                *Standar SUPM: Setiap soal Pilihan Ganda wajib memiliki 5 opsi lengkap (A–E).
              </p>
            </div>

            {/* Jumlah Soal / Tugas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Butir Soal / Tugas <span className="text-red-500">*</span>
              </label>
              <select
                value={form.itemCount}
                onChange={(e) => handleChange('itemCount', parseInt(e.target.value, 10))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-bold text-blue-950"
              >
                <option value={5}>5 Butir (Cocok untuk Kuis Singkat / Diagnostik Cepat)</option>
                <option value={10}>10 Butir (Standar Formatif / Latihan Bab)</option>
                <option value={15}>15 Butir</option>
                <option value={20}>20 Butir (Asesmen Sumatif Tengah Semester)</option>
                <option value={25}>25 Butir</option>
                <option value={30}>30 Butir (Asesmen Sumatif Akhir Semester)</option>
                <option value={40}>40 Butir (Bank Ujian Lengkap / Ujian Sekolah)</option>
              </select>
            </div>
          </div>

          {/* Tingkat Kognitif Taksonomi SOLO */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Tingkat Kognitif: Taksonomi SOLO (Structure of Observed Learning Outcome)
              </label>
              <span className="text-[11px] text-blue-600 font-medium">Pilih satu atau beberapa tingkat</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {SOLO_LEVELS.map((solo) => {
                const checked = form.soloTaxonomyLevels.includes(solo.id);
                return (
                  <button
                    key={solo.id}
                    type="button"
                    onClick={() => handleSoloToggle(solo.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      checked
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{solo.label}</span>
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${checked ? 'bg-blue-600 text-white' : 'border border-slate-300'}`}>
                        {checked && '✓'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{solo.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instruksi Tambahan (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instruksi Khusus Tambahan untuk AI <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={form.additionalInstructions}
              onChange={(e) => handleChange('additionalInstructions', e.target.value)}
              placeholder="Misal: Sertakan studi kasus riil pelayaran di Selat Sunda / Tambahkan data kadar amonia tambak..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenManualPrompt(form)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition"
              title="Salin atau unduh prompt untuk dimasukkan secara mandiri ke Gemini/ChatGPT"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              Mode Manual / Salin Prompt
            </button>
            <button
              type="button"
              onClick={() => setForm(initialValues)}
              className="px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs flex items-center gap-1 transition"
              title="Reset isian formulir"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[220px] px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Asesmen AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Asesmen</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
