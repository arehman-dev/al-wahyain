import React, { useState } from 'react';
import { SurahDispersion } from '../types/quran';

interface SurahDispersionHeatmapProps {
  dispersion: SurahDispersion[];
  totalMatches: number;
  activeSurahFilter: number | null;
  onSelectSurahFilter: (surahId: number | null) => void;
}

export const SurahDispersionHeatmap: React.FC<SurahDispersionHeatmapProps> = ({
  dispersion,
  totalMatches,
  activeSurahFilter,
  onSelectSurahFilter
}) => {
  const [hoveredSurah, setHoveredSurah] = useState<SurahDispersion | null>(null);

  if (!dispersion || dispersion.length === 0 || totalMatches === 0) {
    return null;
  }

  // Find max match count for scaling colors
  const maxMatches = Math.max(...dispersion.map(d => d.match_count), 1);

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5 font-ibm select-none">
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            📊 قرآنی انتشار (114 سورتیں):
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-app">
            {totalMatches} آیات میں موجود
          </span>
        </div>

        {activeSurahFilter && (
          <button
            onClick={() => onSelectSurahFilter(null)}
            className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            سورت فلٹر ختم کریں (تمام سورتیں دکھائیں)
          </button>
        )}

        {hoveredSurah && (
          <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
            سورة {hoveredSurah.name_urdu} ({hoveredSurah.surah_id}):{' '}
            <span className="text-emerald-600 font-app font-bold">{hoveredSurah.match_count} آیات</span>{' '}
            <span className="text-[9px] text-slate-400">
              ({hoveredSurah.revelation_place === 'makkah' ? 'مکی' : 'مدنی'})
            </span>
          </div>
        )}
      </div>

      {/* 114 Surah Horizontal Strip */}
      <div 
        dir="ltr"
        className="w-full h-5 flex gap-[1.5px] items-center bg-slate-200/50 dark:bg-slate-900 rounded-lg p-1 overflow-hidden"
      >
        {dispersion.map((item) => {
          const hasMatches = item.match_count > 0;
          const ratio = item.match_count / maxMatches;
          const isSelected = activeSurahFilter === item.surah_id;

          // Intensity color classes
          let bgClass = 'bg-slate-300/40 dark:bg-slate-800/40 hover:bg-slate-400 dark:hover:bg-slate-700';
          if (hasMatches) {
            if (ratio > 0.6) bgClass = 'bg-emerald-600 dark:bg-emerald-400';
            else if (ratio > 0.3) bgClass = 'bg-emerald-500 dark:bg-emerald-500';
            else bgClass = 'bg-emerald-400/80 dark:bg-emerald-600/80';
          }
          if (isSelected) {
            bgClass = 'bg-amber-500 ring-2 ring-amber-400';
          }

          return (
            <button
              key={item.surah_id}
              onClick={() => onSelectSurahFilter(isSelected ? null : item.surah_id)}
              onMouseEnter={() => setHoveredSurah(item)}
              onMouseLeave={() => setHoveredSurah(null)}
              title={`${item.surah_id}. سورة ${item.name_arabic} — ${item.match_count} آیات`}
              style={{ flex: 1, minWidth: '2px' }}
              className={`h-full rounded-[1px] transition-all cursor-pointer ${bgClass}`}
            />
          );
        })}
      </div>
    </div>
  );
};
