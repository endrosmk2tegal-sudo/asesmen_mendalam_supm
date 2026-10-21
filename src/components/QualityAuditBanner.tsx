import React, { useState } from 'react';
import { QualityAudit, AssessmentPackage } from '../types/assessment';
import { CheckCircle2, AlertTriangle, ShieldCheck, CheckSquare, Square, Info } from 'lucide-react';

interface QualityAuditBannerProps {
  pkg: AssessmentPackage;
  onVerifyTeacher?: (verified: boolean) => void;
}

export const QualityAuditBanner: React.FC<QualityAuditBannerProps> = ({ pkg, onVerifyTeacher }) => {
  const audit = pkg.qualityAudit;
  const [isTeacherVerified, setIsTeacherVerified] = useState(false);

  const toggleVerify = () => {
    const next = !isTeacherVerified;
    setIsTeacherVerified(next);
    if (onVerifyTeacher) onVerifyTeacher(next);
  };

  const isCountExact = audit.requestedItems === audit.generatedItems;
  const isAllPgValid = audit.allPgHave5Options;
  const isKisiKisiComplete = audit.kisiKisiMappedCount >= audit.requestedItems;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-4 sm:p-5 text-white border border-blue-800 shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-blue-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-800/80 border border-blue-600 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
              Pemeriksaan Mutu Otomatis (Quality Audit)
              <span className="text-[11px] bg-blue-800/90 text-blue-200 px-2 py-0.5 rounded-full font-normal border border-blue-700">
                Standar Penjaminan Mutu SUPM
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Validasi kecocokan jumlah butir, opsi pilihan ganda A–E, kelengkapan kisi-kisi, kunci terpisah, dan rubrik penskoran.
            </p>
          </div>
        </div>

        {/* Teacher Verification Toggle */}
        <button
          type="button"
          onClick={toggleVerify}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            isTeacherVerified
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/50'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40'
          }`}
        >
          {isTeacherVerified ? (
            <>
              <CheckSquare className="w-4 h-4 text-white" />
              <span>Diverifikasi Guru Pengampu</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4 text-amber-300" />
              <span>Klik untuk Tandai Sudah Diverifikasi Guru</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {/* Metric 1: Item Count */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCountExact ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
            {isCountExact ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Jumlah Butir</div>
            <div className="text-xs font-bold text-white">
              {audit.generatedItems} / {audit.requestedItems} Butir
            </div>
          </div>
        </div>

        {/* Metric 2: PG 5 Options */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isAllPgValid ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
            {isAllPgValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Pilihan Ganda A–E</div>
            <div className="text-xs font-bold text-white">
              {isAllPgValid ? '100% 5 Opsi (A–E)' : 'Perlu Pengecekan'}
            </div>
          </div>
        </div>

        {/* Metric 3: Kisi-Kisi Mapping */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isKisiKisiComplete ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Pemetaan Kisi-Kisi</div>
            <div className="text-xs font-bold text-white">
              {audit.kisiKisiMappedCount} Butir Terpetakan
            </div>
          </div>
        </div>

        {/* Metric 4: Separate Keys & Rubric */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-950 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Kunci & Rubrik</div>
            <div className="text-xs font-bold text-white">Terpisah & Terstruktur</div>
          </div>
        </div>
      </div>

      {/* Audit Notes */}
      {audit.notes && audit.notes.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-blue-200">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {audit.notes.map((note, idx) => (
              <p key={idx}>{note}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
