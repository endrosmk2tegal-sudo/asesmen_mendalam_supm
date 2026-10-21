import React, { useState } from 'react';
import { AssessmentFormValues } from '../types/assessment';
import { generateAssessmentPrompt } from '../utils/backupPrompt';
import { Copy, Download, Check, X, FileText, AlertTriangle } from 'lucide-react';

interface ManualPromptModalProps {
  form: AssessmentFormValues;
  isOpen: boolean;
  onClose: () => void;
}

export const ManualPromptModal: React.FC<ManualPromptModalProps> = ({ form, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptContent = generateAssessmentPrompt(form);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([promptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanSubject = (form.subject || 'Asesmen').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `SUPM_TEGAL_PromptCadangan_${cleanSubject}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-800 rounded-lg text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Mode Manual Cadangan (Prompt Generator)</h3>
              <p className="text-xs text-blue-200">
                Salin atau unduh teks prompt terstruktur untuk dijalankan secara mandiri di web AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Perhatian Mode Cadangan:</span> Mode ini hanya menghasilkan teks
            prompt asesmen lengkap berdasarkan isian formulir Anda. Salin prompt di bawah ini dan tempelkan langsung ke Google Gemini (gemini.google.com) atau ChatGPT bila kuota API server Anda sedang tidak aktif.
          </div>
        </div>

        {/* Prompt Content Preview */}
        <div className="p-6 flex-1 overflow-y-auto">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Isi Teks Prompt Siap Pakai:
          </label>
          <pre className="p-4 bg-slate-900 text-emerald-300 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-[360px] border border-slate-800">
            {promptContent}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Karakter: {promptContent.length.toLocaleString('id-ID')} karakter
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Unduh Prompt (.txt)
            </button>
            <button
              onClick={handleCopy}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition shadow-md ${
                copied ? 'bg-emerald-600' : 'bg-blue-900 hover:bg-blue-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Prompt Cadangan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
