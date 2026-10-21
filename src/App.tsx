/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AssessmentForm } from './components/AssessmentForm';
import { AssessmentOutput } from './components/AssessmentOutput';
import { ManualPromptModal } from './components/ManualPromptModal';
import { AssessmentFormValues, AssessmentPackage } from './types/assessment';
import {
  Sparkles,
  AlertCircle,
  FileCode,
  RotateCw,
  HelpCircle,
  Anchor,
  Compass,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

const INITIAL_FORM: AssessmentFormValues = {
  teacherName: '',
  subject: 'Navigasi Datar & Peta Laut',
  school: 'SUPM TEGAL',
  gradeLevel: 'SMK',
  gradeClass: 'XI',
  department: 'NKPI',
  assessmentType: 'Sumatif',
  materialTopic: 'Penentuan Posisi Kapal dengan Baringan Silang dan Koreksi Kesalahan Kompas Magnet',
  learningObjectives:
    'Peserta didik mampu menghitung variasi, deviasi, sembiring sejati kapal, serta memplotkan garis baringan silang pada peta laut untuk menentukan posisi pasti (Fix Position) kapal.',
  additionalIndicators:
    'Sesuai standar konvensi internasional STCW-F 1995 dan SKKNI Penangkapan Ikan.',
  instrumentType: 'Pilihan Ganda',
  itemCount: 10,
  soloTaxonomyLevels: ['Unistruktural', 'Multistruktural', 'Relasional'],
  additionalInstructions:
    'Sertakan skenario navigasi maritim nyata di alur pelayaran Laut Jawa atau Selat Karimata.',
};

export default function App() {
  const [formValues, setFormValues] = useState<AssessmentFormValues>(INITIAL_FORM);
  const [currentPackage, setCurrentPackage] = useState<AssessmentPackage | null>(null);
  const [previousPackage, setPreviousPackage] = useState<AssessmentPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const handleGenerate = async (values: AssessmentFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setFormValues(values);

    // Save current package as previous in case new generation fails
    if (currentPackage) {
      setPreviousPackage(currentPackage);
    }

    setLoadingStep('Menghubungkan ke Gemini API server...');
    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Menyusun butir instrumen & naskah soal (5 opsi A-E)...');
    }, 2500);
    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Memetakan Taksonomi SOLO, Kunci Jawaban & Rubrik Penskoran...');
    }, 5500);

    try {
      const response = await fetch('/api/assessments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal memproses perangkat asesmen.');
      }

      setCurrentPackage(data);
      // Scroll to output section smoothly
      setTimeout(() => {
        const outputElem = document.getElementById('assessment-output-section');
        if (outputElem) {
          outputElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } catch (err: any) {
      console.error('Error generate assessment:', err);
      const msg = err?.message || 'Terjadi gangguan jaringan atau pemanggilan API AI.';
      setErrorMessage(msg);
      // Keep previous result intact as requested in Requirement 7 & 10
      if (!currentPackage && previousPackage) {
        setCurrentPackage(previousPackage);
      }
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleRegenerate = () => {
    handleGenerate(formValues);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Official Header */}
      <Header />

      {/* Hero Notice Bar */}
      <div className="bg-blue-900 text-blue-100 py-2 px-4 text-center text-xs font-medium border-b border-blue-950 flex items-center justify-center gap-2">
        <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
        <span>
          Aplikasi Resmi Asesmen Pembelajaran SUPM TEGAL • Didukung Gemini 3.8 Flash • Standar Taksonomi SOLO & Vokasi Maritim
        </span>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Notification Banner if generation fails */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-shake">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-red-900 text-sm">Gagal Menghasilkan Asesmen AI</h4>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">{errorMessage}</p>
                {previousPackage && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    *Hasil asesmen yang telah dibuat sebelumnya tetap tersimpan dan dapat digunakan.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white border border-red-300 hover:bg-red-50 text-red-900 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileCode className="w-4 h-4 text-red-700" />
                <span>Salin Prompt Cadangan</span>
              </button>
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator Modal / Card */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white shadow-xl border border-blue-700 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                <div className="w-6 h-6 border-3 border-amber-300 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-white">
                    Memproses Perangkat Asesmen SUPM Tegal...
                  </h4>
                  <span className="text-xs bg-blue-800 px-2.5 py-1 rounded-full text-blue-200 font-mono">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-1 font-medium">{loadingStep}</p>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Input Form */}
        <section aria-label="Formulir Parameter Asesmen">
          <AssessmentForm
            initialValues={formValues}
            onSubmit={handleGenerate}
            onOpenManualPrompt={(values) => {
              setFormValues(values);
              setIsManualModalOpen(true);
            }}
            isLoading={isLoading}
          />
        </section>

        {/* Assessment Output Display */}
        {currentPackage && (
          <section id="assessment-output-section" aria-label="Hasil Perangkat Asesmen">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-900" />
                Hasil Perangkat Asesmen Siap Pakai
              </h2>
              <span className="text-xs font-semibold text-slate-600">
                Otomatis diverifikasi & siap diekspor
              </span>
            </div>

            <AssessmentOutput
              pkg={currentPackage}
              onUpdatePackage={(updated) => setCurrentPackage(updated)}
              onRegenerate={handleRegenerate}
              isRegenerating={isLoading}
            />
          </section>
        )}
      </main>

      {/* Manual Prompt Modal */}
      <ManualPromptModal
        form={formValues}
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/LOGO_SUPM_TEGAL_241ffe0e.jpeg"
                alt="Logo SUPM Tegal"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">
                SEKOLAH USAHA PERIKANAN MENENGAH (SUPM) TEGAL
              </p>
              <p className="text-[11px] text-slate-400">
                Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDM KP)
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] space-y-0.5">
            <p>Jl. Martoloyo PO BOX 22 Tegal 52111, Jawa Tengah | Telp/Fax: (0283) 356246</p>
            <p className="text-slate-500">
              Generator Perangkat Asesmen Pembelajaran Vokasi Maritim • Hak Cipta © {new Date().getFullYear()} SUPM TEGAL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
