import React, { useState } from 'react';
import { AssessmentPackage, ExportSection } from '../types/assessment';
import { QualityAuditBanner } from './QualityAuditBanner';
import {
  Table as TableIcon,
  FileText,
  KeyRound,
  Award,
  Download,
  Printer,
  Edit3,
  Check,
  ChevronDown,
  FileSpreadsheet,
  FileBox,
  Copy,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface AssessmentOutputProps {
  pkg: AssessmentPackage;
  onUpdatePackage: (updated: AssessmentPackage) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const AssessmentOutput: React.FC<AssessmentOutputProps> = ({
  pkg,
  onUpdatePackage,
  onRegenerate,
  isRegenerating,
}) => {
  const [activeTab, setActiveTab] = useState<'kisi-kisi' | 'soal' | 'kunci' | 'rubrik'>('soal');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localPkg, setLocalPkg] = useState<AssessmentPackage>(pkg);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sync if pkg changes externally
  React.useEffect(() => {
    setLocalPkg(pkg);
  }, [pkg]);

  const handleExport = async (format: 'docx' | 'pdf', section: ExportSection) => {
    try {
      setIsExporting(`${format}-${section}`);
      const endpoint = format === 'docx' ? '/api/assessments/export/docx' : '/api/assessments/export/pdf';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: localPkg, section }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh file.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanSubject = (localPkg.metadata.subject || 'Asesmen').replace(/[^a-zA-Z0-9]/g, '_');
      const sectionName =
        section === 'all'
          ? 'PaketLengkap'
          : section === 'kisi-kisi'
          ? 'KisiKisi'
          : section === 'soal'
          ? 'NaskahSoal'
          : section === 'kunci'
          ? 'KunciJawaban'
          : 'Rubrik';
      a.download = `SUPM_TEGAL_${sectionName}_${cleanSubject}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error', err);
      alert('Terjadi kendala saat mengunduh file. Silakan coba kembali.');
    } finally {
      setIsExporting(null);
      setShowExportMenu(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const saveEdits = () => {
    setIsEditMode(false);
    onUpdatePackage(localPkg);
  };

  return (
    <div className="space-y-6">
      {/* Quality Audit Banner */}
      <QualityAuditBanner pkg={localPkg} />

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Output Header with Title & Action Toolbar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 px-6 py-4 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {localPkg.metadata.assessmentType}
              </span>
              <span className="text-xs text-blue-200">
                Kelas {localPkg.metadata.gradeClass} • {localPkg.metadata.department} ({localPkg.metadata.departmentFullName})
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">
              {localPkg.metadata.subject}
            </h3>
            <p className="text-xs text-slate-300">
              Guru Pengampu: {localPkg.metadata.teacherName || 'Guru SUPM Tegal'} • {localPkg.metadata.itemCount} Butir ({localPkg.metadata.instrumentType})
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Edit Mode Toggle */}
            <button
              onClick={() => (isEditMode ? saveEdits() : setIsEditMode(true))}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isEditMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-blue-200 border border-slate-700'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Butir / Kunci</span>
                </>
              )}
            </button>

            {/* Regenerate Button */}
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-3 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              title="Generate ulang dengan parameter yang sama"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Memproses...' : 'Generate Ulang'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Cetak tampilan dokumen"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Dokumen</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-900 animate-fade-in text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Format Word (.docx) Resmi
                  </div>
                  <button
                    onClick={() => handleExport('docx', 'all')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 font-semibold text-blue-950 flex items-center justify-between"
                  >
                    <span>📦 Paket Lengkap (.docx)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">All-in-One</span>
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'soal')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700 flex items-center justify-between"
                  >
                    <span>📝 Naskah Soal Saja (.docx)</span>
                    <span className="text-[10px] text-slate-500">Siswa (Tanpa Kunci)</span>
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'kisi-kisi')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700"
                  >
                    📊 Kisi-Kisi Soal Saja (.docx)
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'kunci')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700"
                  >
                    🔑 Kunci & Pembahasan Saja (.docx)
                  </button>
                  <button
                    onClick={() => handleExport('docx', 'rubrik')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 text-slate-700"
                  >
                    📋 Rubrik & Penskoran (.docx)
                  </button>

                  <div className="px-3 py-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-b border-slate-100">
                    Format PDF Siap Cetak
                  </div>
                  <button
                    onClick={() => handleExport('pdf', 'all')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 font-semibold text-red-950 flex items-center justify-between"
                  >
                    <span>📦 Paket Lengkap (.pdf)</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">All-in-One</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf', 'soal')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-slate-700 flex items-center justify-between"
                  >
                    <span>📝 Naskah Soal Saja (.pdf)</span>
                    <span className="text-[10px] text-slate-500">Siswa</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf', 'kisi-kisi')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-slate-700"
                  >
                    📊 Kisi-Kisi Soal Saja (.pdf)
                  </button>
                  <button
                    onClick={() => handleExport('pdf', 'kunci')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-slate-700"
                  >
                    🔑 Kunci & Pembahasan Saja (.pdf)
                  </button>
                  <button
                    onClick={() => handleExport('pdf', 'rubrik')}
                    disabled={Boolean(isExporting)}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-slate-700"
                  >
                    📋 Rubrik & Penskoran (.pdf)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Four Main Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setActiveTab('soal')}
            className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'soal'
                ? 'bg-white text-blue-900 border-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>B. Naskah Soal Siswa</span>
            <span className="text-[11px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-semibold">
              {localPkg.questions?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('kisi-kisi')}
            className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'kisi-kisi'
                ? 'bg-white text-blue-900 border-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <TableIcon className="w-4 h-4 text-indigo-600" />
            <span>A. Kisi-Kisi Soal</span>
            <span className="text-[11px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-semibold">
              {localPkg.kisiKisi?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('kunci')}
            className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'kunci'
                ? 'bg-white text-blue-900 border-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>C. Kunci Jawaban Terpisah</span>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
              Guru
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rubrik')}
            className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-xl transition-all flex items-center gap-2 border-t-2 ${
              activeTab === 'rubrik'
                ? 'bg-white text-blue-900 border-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>D. Rubrik & Penskoran</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          {/* TAB 1: KISI-KISI SOAL */}
          {activeTab === 'kisi-kisi' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <TableIcon className="w-5 h-5 text-indigo-600" />
                    Kisi-Kisi Asesmen Pembelajaran ({localPkg.metadata.assessmentType})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Memetakan Tujuan Pembelajaran, Indikator Soal, Level Taksonomi SOLO, dan Bobot Skor.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gradient-to-r from-blue-950 to-slate-900 text-white uppercase text-[11px]">
                    <tr>
                      <th className="px-3 py-3 text-center w-12">No</th>
                      <th className="px-4 py-3 w-1/4">Tujuan Pembelajaran</th>
                      <th className="px-4 py-3 w-1/5">Materi Pokok</th>
                      <th className="px-4 py-3 w-1/4">Indikator Soal / Tugas</th>
                      <th className="px-3 py-3 text-center">Level SOLO</th>
                      <th className="px-3 py-3 text-center">Bentuk</th>
                      <th className="px-3 py-3 text-center">No Butir</th>
                      <th className="px-3 py-3 text-center">Skor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(localPkg.kisiKisi || []).map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 hover:bg-blue-50/40'}>
                        <td className="px-3 py-3 text-center font-bold text-slate-700">{item.number || idx + 1}</td>
                        <td className="px-4 py-3 text-slate-800 leading-relaxed font-medium">
                          {item.learningObjective}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{item.topic}</td>
                        <td className="px-4 py-3 text-slate-800 leading-relaxed">{item.indicator}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-blue-100 text-blue-900 border border-blue-200">
                            {item.soloLevel}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600">{item.instrumentType}</td>
                        <td className="px-3 py-3 text-center font-bold text-blue-900">{item.itemNumber}</td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-700">{item.weightScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: NASKAH SOAL (BERSIH DARI KUNCI - SIAP CETAK UNTUK SISWA) */}
          {activeTab === 'soal' && (
            <div className="space-y-6">
              {/* Exam Header for Students */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                <div className="text-center pb-3 border-b border-slate-200">
                  <h4 className="font-black text-sm sm:text-base text-blue-950">
                    SEKOLAH USAHA PERIKANAN MENENGAH (SUPM) TEGAL
                  </h4>
                  <p className="text-xs font-semibold text-slate-700">
                    LEMBAR NASKAH ASESMEN {localPkg.metadata.assessmentType.toUpperCase()}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3 text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-500">Mata Pelajaran:</span>{' '}
                    <span className="font-bold">{localPkg.metadata.subject}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Kelas/Jurusan:</span>{' '}
                    <span className="font-bold">
                      {localPkg.metadata.gradeClass} - {localPkg.metadata.department}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Alokasi Waktu:</span>{' '}
                    <span className="font-bold">Sesuai Instruksi Pengawas</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Bentuk Soal:</span>{' '}
                    <span className="font-bold">{localPkg.metadata.instrumentType}</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  <strong>Petunjuk Peserta Didik:</strong> 1. Berdoalah sebelum mulai mengerjakan. 2. Tuliskan identitas nama dan NIS pada lembar jawaban. 3. Pilihlah satu jawaban yang paling tepat pada setiap butir soal pilihan ganda. 4. Dilarang bekerja sama atau menggunakan gawai tanpa izin pengawas.
                </div>
              </div>

              {/* Notice: Pure Student Copy */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium">
                    Naskah peserta didik ini <strong>bersih dari kunci jawaban</strong> dan siap dicetak/diekspor untuk ujian.
                  </span>
                </div>
                <button
                  onClick={() => handleExport('pdf', 'soal')}
                  className="px-3 py-1 bg-blue-900 text-white rounded-lg font-semibold text-[11px] hover:bg-blue-800 transition"
                >
                  Unduh PDF Naskah Siswa
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {(localPkg.questions || []).map((q, qIndex) => (
                  <div
                    key={q.number || qIndex}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                          {q.number}
                        </span>
                        <span className="font-semibold text-slate-700">{q.instrumentType}</span>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        Level SOLO: {q.soloLevel}
                      </span>
                    </div>

                    {/* Stimulus Wacana */}
                    {q.stimulus && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border-l-4 border-blue-900 text-slate-800 text-xs leading-relaxed italic">
                        <span className="font-bold text-blue-900 not-italic block mb-1">
                          Stimulus / Skenario Maritim:
                        </span>
                        {q.stimulus}
                      </div>
                    )}

                    {/* Question Text */}
                    {isEditMode ? (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500">Teks Soal:</label>
                        <textarea
                          rows={2}
                          value={q.questionText}
                          onChange={(e) => {
                            const updated = [...localPkg.questions];
                            updated[qIndex].questionText = e.target.value;
                            setLocalPkg({ ...localPkg, questions: updated });
                          }}
                          className="w-full p-2 border border-blue-400 rounded-lg text-sm"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {q.questionText}
                      </p>
                    )}

                    {/* Options (Wajib 5 Opsi A, B, C, D, E) */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {q.options.map((opt, optIndex) => (
                          <div
                            key={opt.key || optIndex}
                            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs text-slate-800"
                          >
                            <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-300 font-bold text-slate-700 flex items-center justify-center shrink-0">
                              {opt.key}
                            </span>
                            {isEditMode ? (
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const updated = [...localPkg.questions];
                                  if (updated[qIndex].options) {
                                    updated[qIndex].options![optIndex].text = e.target.value;
                                  }
                                  setLocalPkg({ ...localPkg, questions: updated });
                                }}
                                className="flex-1 p-1 border border-slate-300 rounded text-xs"
                              />
                            ) : (
                              <span className="pt-0.5 leading-relaxed">{opt.text}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Instructions for Essay/Practice */}
                    {q.instructions && (
                      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                        <span className="font-semibold text-slate-800">Petunjuk Tugas/Format Jawaban:</span>{' '}
                        {q.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KUNCI JAWABAN TERPISAH (PEGANGAN GURU) */}
          {activeTab === 'kunci' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-900">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Dokumen Rahasia - Pegangan Guru & Penguji</h5>
                    <p className="text-red-700">
                      Bagian ini terpisah secara mandiri dan tidak dicampur ke dalam naskah peserta didik.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleExport('pdf', 'kunci')}
                  className="px-3 py-1.5 bg-red-800 text-white rounded-lg font-semibold text-xs hover:bg-red-700 transition"
                >
                  Unduh PDF Kunci Jawaban
                </button>
              </div>

              <div className="space-y-4">
                {(localPkg.answerKeys || []).map((ak, akIndex) => (
                  <div
                    key={ak.number || akIndex}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm transition space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center justify-center">
                          {ak.number}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Kunci Jawaban Benar:</span>
                          <span className="px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-sm">
                            {ak.correctAnswer}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pembahasan Ilmiah */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 leading-relaxed">
                      <span className="font-bold text-emerald-900 block mb-1">
                        Pembahasan Ilmiah & Konsep Vokasi Maritim:
                      </span>
                      {isEditMode ? (
                        <textarea
                          rows={2}
                          value={ak.explanation}
                          onChange={(e) => {
                            const updated = [...localPkg.answerKeys];
                            updated[akIndex].explanation = e.target.value;
                            setLocalPkg({ ...localPkg, answerKeys: updated });
                          }}
                          className="w-full p-2 border border-emerald-300 rounded-lg text-xs"
                        />
                      ) : (
                        ak.explanation
                      )}
                    </div>

                    {/* Unsur Esensial Kinerja / Kunci Jawaban */}
                    {ak.expectedElements && ak.expectedElements.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Unsur Kunci Jawaban / Kinerja yang Diharapkan:
                        </span>
                        <ul className="space-y-1">
                          {ak.expectedElements.map((el, i) => (
                            <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{el}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RUBRIK & PEDOMAN PENSKORAN */}
          {activeTab === 'rubrik' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-bold uppercase text-blue-800 mb-1">Karakteristik Asesmen</div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {localPkg.rubric?.instrumentSummary ||
                      'Instrumen disusun berjenjang sesuai Taksonomi SOLO dan standar uji kompetensi perikanan.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="text-xs font-bold uppercase text-indigo-800 mb-1">Rumus Nilai Akhir (Skala 0-100)</div>
                  <p className="text-sm font-extrabold text-indigo-950 font-mono">
                    {localPkg.rubric?.scoringFormula ||
                      'Nilai = (Total Skor Perolehan / Total Skor Maksimal) x 100'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold uppercase text-emerald-800 mb-1">Kriteria Ketuntasan (KKTP)</div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {localPkg.rubric?.passingGradeAdvice ||
                      'Taruna dinyatakan tuntas kompetensi jika memperoleh nilai minimal 75 (skala 100).'}
                  </p>
                </div>
              </div>

              {/* Rubric Criteria Table (if available) */}
              {localPkg.rubric?.criteria && localPkg.rubric.criteria.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    Rubrik Penilaian & Deskriptor Kualitas Kinerja
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-white uppercase text-[11px]">
                        <tr>
                          <th className="px-4 py-3 w-1/4">Aspek Penilaian</th>
                          <th className="px-3 py-3 text-center w-20">Bobot</th>
                          <th className="px-4 py-3">Deskriptor Pencapaian & Skala Skor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {localPkg.rubric.criteria.map((crit, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="px-4 py-3 font-bold text-slate-800 align-top">{crit.aspect}</td>
                            <td className="px-3 py-3 text-center font-bold text-blue-900 align-top">{crit.weight}%</td>
                            <td className="px-4 py-3 space-y-2">
                              {crit.levels.map((lvl, lIdx) => (
                                <div key={lIdx} className="p-2 rounded bg-white border border-slate-200 text-xs">
                                  <span className="font-bold text-blue-900">
                                    [{lvl.level} - Skor {lvl.score}]:
                                  </span>{' '}
                                  <span className="text-slate-700">{lvl.description}</span>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Follow-up Recommendations (Diferensiasi Pembelajaran) */}
              {localPkg.rubric?.followUpRecommendations &&
                localPkg.rubric.followUpRecommendations.length > 0 && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white space-y-3">
                    <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Pedoman Tindak Lanjut & Diferensiasi Pembelajaran Guru:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {localPkg.rubric.followUpRecommendations.map((rec, rIdx) => (
                        <div key={rIdx} className="p-3.5 rounded-xl bg-white/10 border border-white/20 text-xs">
                          <span className="font-bold text-amber-200 block mb-1">{rec.category}</span>
                          <p className="text-slate-200 leading-relaxed">{rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
