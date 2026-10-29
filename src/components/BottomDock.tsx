import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Gauge, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  LayoutGrid, 
  List, 
  BookOpen, 
  Share2, 
  Volume2 
} from 'lucide-react';
import { Ayah, Surah, ScriptMode, AppMode, MushafDisplayMode } from '../types/quran';
import { getJuzForPage, JUZ_NAMES_AR } from '../utils/juzMapping';

interface BottomDockProps {
  currentSurah: Surah | undefined;
  currentAyah: Ayah | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onWordTimeUpdate: (wordIndex: number | null) => void;
  activeMode: AppMode;
  scriptMode: ScriptMode;
  onToggleScript: () => void;
  fontSize: number;
  onFontSizeChange: (newSize: number) => void;
  tafsirLayout: 'stacked' | 'grid';
  onToggleTafsirLayout: () => void;
  mushafDisplayMode: MushafDisplayMode;
  onToggleMushafDisplayMode: () => void;
  onOpenExportModal: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentSurah,
  currentAyah,
  isPlaying,
  onPlay,
  onPause,
  onNextAyah,
  onPrevAyah,
  onWordTimeUpdate,
  activeMode,
  scriptMode,
  onToggleScript,
  fontSize,
  onFontSizeChange,
  tafsirLayout,
  onToggleTafsirLayout,
  mushafDisplayMode,
  onToggleMushafDisplayMode,
  onOpenExportModal
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);

  // Sync audio source
  useEffect(() => {
    if (!audioRef.current || !currentAyah?.audio_url) return;
    audioRef.current.src = currentAyah.audio_url;
    audioRef.current.playbackRate = playbackRate;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentAyah?.audio_url]);

  // Sync play/pause state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const timeMs = audioRef.current.currentTime * 1000;

    // Synchronize word segments [[word_idx, word_seq, start_ms, end_ms], ...]
    if (currentAyah?.audio_segments && currentAyah.audio_segments.length > 0) {
      const activeSegment = currentAyah.audio_segments.find(
        ([, , start, end]) => timeMs >= start && timeMs <= end
      );
      onWordTimeUpdate(activeSegment ? activeSegment[0] : null);
    }
  };

  const handleEnded = () => {
    if (repeatCount === Infinity || currentRepeat < repeatCount) {
      setCurrentRepeat(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      setCurrentRepeat(1);
      onNextAyah();
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  };

  const cycleRepeat = () => {
    if (repeatCount === 1) setRepeatCount(3);
    else if (repeatCount === 3) setRepeatCount(5);
    else if (repeatCount === 5) setRepeatCount(Infinity);
    else setRepeatCount(1);
    setCurrentRepeat(1);
  };

  const juzNum = currentAyah ? getJuzForPage(currentAyah.page_madani || 1) : 1;
  const juzTitle = JUZ_NAMES_AR[juzNum] || `الجزء ${juzNum}`;

  return (
    <footer 
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-40 w-full h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-lg px-4 sm:px-6 flex items-center justify-between text-xs font-ibm select-none transition-colors"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Right Flank: Telemetry & Status Breadcrumb */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
          <span className="text-emerald-700 dark:text-emerald-400">
            {currentSurah?.name_urdu || 'سورۃ'}
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            {currentAyah?.verse_key || '1:1'}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 hidden md:inline font-arabic">
          {juzTitle}
        </span>
      </div>

      {/* Center: Audio Recitation Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Prev Ayah Stepper */}
        <button
          onClick={onPrevAyah}
          title="پچھلی آیت"
          className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={() => isPlaying ? onPause() : onPlay()}
          title={isPlaying ? "تلاوت موقوف کریں (Space)" : "تلاوت شروع کریں (Space)"}
          className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xs transition-all transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current mr-0.5" />}
        </button>

        {/* Next Ayah Stepper */}
        <button
          onClick={onNextAyah}
          title="اگلی آیت"
          className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Reciter Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-100/70 dark:bg-slate-800/70">
          <Volume2 className="w-3 h-3 text-emerald-600" />
          <span>مشاری العفاسی</span>
        </div>

        {/* Repeat Loop Stepper */}
        <button
          onClick={cycleRepeat}
          title="تکرار / حفظ لوپ (Repeat Ayah)"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-mono font-bold transition-colors ${
            repeatCount > 1 || repeatCount === Infinity
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Repeat className="w-3 h-3" />
          <span>{repeatCount === Infinity ? '∞' : `${repeatCount}x`}</span>
        </button>

        {/* Speed Stepper */}
        <button
          onClick={cycleSpeed}
          title="رفتار تلاوت (Speed)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-mono font-bold transition-colors"
        >
          <Gauge className="w-3 h-3" />
          <span>{playbackRate}x</span>
        </button>
      </div>

      {/* Left Flank: Power-User Quick Tools */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Font Scaler */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px]">
          <button 
            onClick={() => onFontSizeChange(Math.max(14, fontSize - 1))}
            title="فونٹ چھوٹا کریں"
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="px-1 text-slate-600 dark:text-slate-300 font-bold">{fontSize}</span>
          <button 
            onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
            title="فونٹ بڑا کریں"
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        {/* Script Mode Switcher (Madani vs Indo-Pak) */}
        <button
          onClick={onToggleScript}
          title={scriptMode === 'indopak' ? 'عثمانی / مدنی رسم الخط پر سوئچ کریں' : 'پاکستانی / انڈو پاک رسم الخط پر سوئچ کریں'}
          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] rounded-lg transition-colors"
        >
          {scriptMode === 'indopak' ? 'انڈو-پاک' : 'مدنی'}
        </button>

        {/* Mode-Specific Quick Toggles */}
        {activeMode === 'tafsir' && (
          <button
            onClick={onToggleTafsirLayout}
            title={tafsirLayout === 'grid' ? "عمودی اسٹیکڈ منظر (1 Column)" : "تقابلی ۲-کالم منظر (Side-by-Side Grid)"}
            className={`p-1.5 rounded-lg border transition-colors ${
              tafsirLayout === 'grid'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tafsirLayout === 'grid' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
          </button>
        )}

        {activeMode === 'mushaf' && (
          <button
            onClick={onToggleMushafDisplayMode}
            title={mushafDisplayMode === 'page' ? "مسلسل منظر (Continuous Reading)" : "صفحہ وار مصحف منظر (15-line Page)"}
            className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
              mushafDisplayMode === 'page'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {mushafDisplayMode === 'page' ? 'صفحہ وار' : 'مسلسل'}
          </button>
        )}

        {/* Share / Export Trigger */}
        <button
          onClick={onOpenExportModal}
          title="آیت و تفاسیر برآمد کریں (Export & Share)"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

      </div>
    </footer>
  );
};
