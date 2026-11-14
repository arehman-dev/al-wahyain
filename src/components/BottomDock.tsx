import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Gauge, 
  Volume2,
  Share2,
  Search,
  Maximize2,
  Minimize2,
  MoveHorizontal
} from 'lucide-react';
import { Ayah, Surah } from '../types/quran';
import { NavArrowMode } from '../types/shortcuts';

interface BottomDockProps {
  currentSurah: Surah | undefined;
  currentAyah: Ayah | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  navArrowMode?: NavArrowMode;
  onWordTimeUpdate: (wordIndex: number | null) => void;
  onOpenExportModal?: () => void;
  onOpenSearch: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  horizontalPadding: number;
  onChangeHorizontalPadding: (val: number) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentSurah,
  currentAyah,
  isPlaying,
  onPlay,
  onPause,
  onNextAyah,
  onPrevAyah,
  navArrowMode = 'rtl',
  onWordTimeUpdate,
  onOpenExportModal,
  onOpenSearch,
  isZenMode,
  onToggleZenMode,
  horizontalPadding,
  onChangeHorizontalPadding
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [showPaddingSlider, setShowPaddingSlider] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Sync audio source
  useEffect(() => {
    if (!audioRef.current || !currentAyah?.audio_url) {
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    audioRef.current.src = currentAyah.audio_url;
    audioRef.current.playbackRate = playbackRate;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentAyah?.audio_url]);

  // Sync play/pause state
  useEffect(() => {
    if (!audioRef.current || !currentAyah?.audio_url) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentAyah?.audio_url]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);
    const dur = audioRef.current.duration;
    if (dur && !isNaN(dur)) setDuration(dur);

    const timeMs = cur * 1000;

    if (currentAyah?.audio_segments && currentAyah.audio_segments.length > 0) {
      const activeSegment = currentAyah.audio_segments.find(
        ([, , start, end]) => timeMs >= start && timeMs <= end
      );
      onWordTimeUpdate(activeSegment ? activeSegment[0] : null);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration || isNaN(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = pct * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

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
    const counts = [1, 3, 5, Infinity];
    const nextIdx = (counts.indexOf(repeatCount) + 1) % counts.length;
    const nextCount = counts[nextIdx];
    setRepeatCount(nextCount);
    setCurrentRepeat(1);
  };

  return (
    <footer 
      dir="ltr"
      className="fixed bottom-0 left-0 right-0 z-40 h-11 glass-bar border-t px-3 sm:px-6 font-ibm select-none transition-all"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Audio Timeline Scrubber Bar */}
      <div 
        onClick={handleSeek}
        className={`absolute top-0 left-0 right-0 h-1 hover:h-2 transition-all duration-150 cursor-pointer group z-30 ${
          currentAyah?.audio_url ? 'bg-slate-300/40 dark:bg-slate-700/40' : 'hidden'
        }`}
        title={duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)} (وقت تبدیل کرنے کے لیے کلک کریں)` : undefined}
      >
        <div 
          className="h-full bg-emerald-500 group-hover:bg-emerald-400 transition-[width] duration-75 relative shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          style={{ width: `${progressPercent}%` }}
        >
          <span className="opacity-0 group-hover:opacity-100 absolute -right-1.5 -top-1 w-3.5 h-3.5 bg-emerald-600 dark:bg-emerald-400 rounded-full shadow-md transition-opacity duration-150 ring-2 ring-white dark:ring-slate-900" />
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-between">

        {/* ======================================================== */}
        {/* LEFT SIDE (Left -> Right): Zen -> Search -> Share -> Padding Slider */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 z-10 shrink-0">
          
          {/* 1. Zen Mode */}
          <button
            onClick={onToggleZenMode}
            title={isZenMode ? "نارمل موڈ میں واپس جائیں (Z / Esc)" : "زین موڈ (مکمل یکسوئی) (Z)"}
            aria-label="زین موڈ"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
              isZenMode
                ? 'border border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" strokeWidth={1.85} /> : <Maximize2 className="w-4 h-4" strokeWidth={1.85} />}
          </button>

          {/* 2. Search */}
          <button
            onClick={onOpenSearch}
            title="قرآنی تلاش (Ctrl+K)"
            aria-label="قرآنی تلاش"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4" strokeWidth={1.85} />
          </button>

          {/* 3. Share */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              title="آیت کا اقتباس یا اشتراک"
              aria-label="آیت کا اشتراک"
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.85} />
            </button>
          )}

          <div className="h-4 w-px bg-slate-300/70 dark:bg-slate-700/70 mx-0.5 hidden sm:block" />

          {/* 4. Horizontal Padding Slider */}
          <div className="h-8 flex items-center gap-1.5 bg-slate-200/65 dark:bg-slate-800/75 rounded-xl px-2.5 py-0.5 border border-slate-300/50 dark:border-slate-700/60 shadow-xs">
            <button
              onClick={() => setShowPaddingSlider(prev => !prev)}
              title="صفحہ کے حاشیے کی وسعت (Margin Padding)"
              aria-label="حاشیہ کی چوڑائی"
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center"
            >
              <MoveHorizontal className="w-3.5 h-3.5" strokeWidth={1.85} />
            </button>
            {showPaddingSlider && (
              <div className="hidden sm:flex items-center gap-1.5">
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={horizontalPadding}
                  onChange={(e) => onChangeHorizontalPadding(Number(e.target.value))}
                  className="w-16 md:w-20 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <span className="text-[10px] font-app font-bold text-slate-600 dark:text-slate-300 min-w-[24px] text-right">
                  {horizontalPadding}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER (Screen-Centered): Audio Playback Controls        */}
        {/* Play/Pause is the exact center, nearby buttons aligned   */}
        {/* symmetrically with reference to Play/Pause               */}
        {/* ======================================================== */}
        <div dir="rtl" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 select-none">
          {/* Right Flank (in RTL): Repeat & Previous Ayah */}
          <button
            onClick={cycleRepeat}
            disabled={!currentAyah}
            title="تکرار (Repeat)"
            className={`hidden sm:flex items-center justify-center gap-1 h-8 px-2.5 min-w-[48px] rounded-xl border text-[11px] font-app font-bold transition-all duration-150 active:scale-95 shadow-xs ${
              !currentAyah
                ? 'opacity-30 cursor-not-allowed border-slate-300/40 dark:border-slate-700/40 text-slate-400'
                : repeatCount > 1 || repeatCount === Infinity
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 cursor-pointer'
                : 'border-slate-300/50 dark:border-slate-700/60 bg-slate-200/40 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 cursor-pointer'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" strokeWidth={1.85} />
            <span>
              {repeatCount === Infinity 
                ? `∞` 
                : repeatCount > 1 
                ? `${currentRepeat}/${repeatCount}` 
                : '1x'}
            </span>
          </button>

          <button
            onClick={onPrevAyah}
            title={navArrowMode === 'rtl' ? 'پچھلی آیت (دائیں تیر → / K)' : 'پچھلی آیت (بائیں تیر ← / J)'}
            aria-label="پچھلی آیت"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" strokeWidth={1.85} />
          </button>

          {/* Focal Centerpiece: Play / Pause Button */}
          <button
            onClick={() => isPlaying ? onPause() : onPlay()}
            disabled={!currentAyah}
            title={!currentAyah ? '0-intro کے لیے تلاوت دستیاب نہیں ہے' : isPlaying ? 'روکیں (Pause / Space)' : 'چلائیں (Play / Space)'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-150 shadow-sm shrink-0 ${
              !currentAyah 
                ? 'border-slate-300/40 dark:border-slate-700/40 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed' 
                : 'border-emerald-500 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 active:scale-90 cursor-pointer ring-2 ring-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4.5 h-4.5" strokeWidth={1.85} />
            ) : (
              <Play className="w-4.5 h-4.5" strokeWidth={1.85} />
            )}
          </button>

          {/* Left Flank (in RTL): Next Ayah & Playback Speed */}
          <button
            onClick={onNextAyah}
            title={navArrowMode === 'rtl' ? 'اگلی آیت (بائیں تیر ← / J)' : 'اگلی آیت (دائیں تیر → / K)'}
            aria-label="اگلی آیت"
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-300/40 dark:border-slate-700/50 hover:border-emerald-500/40 bg-slate-200/40 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <SkipBack className="w-4 h-4" strokeWidth={1.85} />
          </button>

          <button
            onClick={cycleSpeed}
            disabled={!currentAyah}
            title="رفتارِ تلاوت (Speed)"
            className={`hidden sm:flex items-center justify-center gap-1 h-8 px-2.5 min-w-[48px] rounded-xl border text-[11px] font-app font-bold transition-all duration-150 active:scale-95 shadow-xs ${
              !currentAyah
                ? 'opacity-30 cursor-not-allowed border-slate-300/40 dark:border-slate-700/40 text-slate-400'
                : 'border-slate-300/50 dark:border-slate-700/60 bg-slate-200/40 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" strokeWidth={1.85} />
            <span>{playbackRate}x</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Current Surah/Ayah & Reciter Info            */}
        {/* ======================================================== */}
        <div dir="rtl" className="flex items-center gap-2.5 min-w-0 justify-end z-10 shrink-0">
          {/* Subtle Audio Duration Indicator */}
          {duration > 0 && currentAyah && (
            <span dir="ltr" className="hidden lg:inline-flex items-center text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 tabular-nums px-2 py-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/60 shadow-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>سورة {currentSurah?.name_arabic || 'الفاتحة'}</span>
            {currentAyah ? (
              <span className="text-slate-500 dark:text-slate-400 font-app text-[11px] font-bold">
                ({currentAyah.ayah_number})
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                (0-intro)
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1 rounded-xl bg-slate-200/50 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/60 shadow-xs">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.85} />
            <span>مشاری راشد العفاسی</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
