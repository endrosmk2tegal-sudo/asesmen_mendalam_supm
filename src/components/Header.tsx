import React from 'react';
import { Compass, Anchor, Award, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-blue-900/60 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Titles */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-1 shadow-md border-2 border-amber-400 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                <img
                  src="/assets/aistudio/LOGO_SUPM_TEGAL_241ffe0e.jpeg"
                  alt="Logo SUPM Tegal"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback anchor icon if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full ring-2 ring-slate-900">
                <Anchor className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Kementerian Kelautan dan Perikanan RI
                </span>
                <span className="hidden sm:inline-block text-xs bg-blue-800/80 text-blue-200 px-2 py-0.5 rounded-full font-medium border border-blue-600/40">
                  SMK Maritim
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                SUPM TEGAL <span className="text-blue-400 font-semibold text-lg sm:text-xl">ASSESMEN MENDALAM</span>
              </h1>
              <p className="text-xs text-slate-300 hidden sm:block">
                Generator Perangkat Asesmen Terstandar (Diagnostik, Formatif, Sumatif) berbasis Taksonomi SOLO
              </p>
            </div>
          </div>

          {/* Department Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-blue-900/60 border border-blue-700/50 text-blue-200 font-medium" title="Nautika Kapal Penangkap Ikan">
              ⚓ NKPI
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-900/60 border border-cyan-700/50 text-cyan-200 font-medium" title="Teknika Kapal Penangkap Ikan">
              ⚙️ TKPI
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 font-medium" title="Agribisnis Perikanan Air Payau dan Laut">
              🐟 APPL
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-900/60 border border-amber-700/50 text-amber-200 font-medium" title="Agribisnis Pengolahan Hasil Perikanan">
              🥫 APHP
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
