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
  MoveHorizontal,
  ScrollText
} from 'lucide-react';
import { Ayah, Surah, AppMode, HadithBook, HadithChapter } from '../types/quran';

interface BottomDockProps {
  currentSurah: Surah | undefined;
  currentAyah: Ayah | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onWordTimeUpdate: (wordIndex: number | null) => void;
  onOpenExportModal?: () => void;
  onOpenSearch: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  horizontalPadding: number;
  onChangeHorizontalPadding: (val: number) => void;
  activeMode?: AppMode;
  currentHadithBook?: HadithBook | null;
  currentHadithChapter?: HadithChapter | null;
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
  onOpenExportModal,
  onOpenSearch,
  isZenMode,
  onToggleZenMode,
  horizontalPadding,
  onChangeHorizontalPadding,
  activeMode,
  currentHadithBook,
  currentHadithChapter
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [showPaddingSlider, setShowPaddingSlider] = useState<boolean>(true);

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
        onEnded={handleEnded}
      />

      <div className="w-full h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2">

        {/* ======================================================== */}
        {/* LEFT SIDE (Left -> Right): Zen -> Search -> Share -> Padding Slider */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 justify-self-start">
          
          {/* 1. Zen Mode (Icon-only per 3.4) */}
          <button
            onClick={onToggleZenMode}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isZenMode
                ? 'border border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" strokeWidth={1.85} /> : <Maximize2 className="w-4 h-4" strokeWidth={1.85} />}
          </button>

          {/* 2. Search (Icon-only per 3.4) */}
          <button
            onClick={onOpenSearch}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" strokeWidth={1.85} />
          </button>

          {/* 3. Share (Icon-only per 3.4) */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.85} />
            </button>
          )}

          <div className="h-4 w-px bg-slate-300/70 dark:bg-slate-700/70 mx-0.5 hidden sm:block" />

          {/* 4. Right-most in Left Corner: Horizontal Padding Slider */}
          <div className="flex items-center gap-1.5 bg-slate-200/65 dark:bg-slate-800/75 rounded-xl px-2 py-1 border border-slate-300/60 dark:border-slate-700/60">
            <button
              onClick={() => setShowPaddingSlider(prev => !prev)}
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
        {/* CENTER (Screen-Centered): Audio Playback or Hadith Status */}
        {/* ======================================================== */}
        <div dir="rtl" className="flex items-center justify-center gap-1.5 justify-self-center">
          {activeMode === 'hadith' && !isPlaying ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold px-3 py-1 rounded-xl bg-slate-200/40 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700/40">
              <ScrollText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.85} />
              <span>مجموعۂ کتبِ حدیث نبوی ﷺ</span>
            </div>
          ) : (
            <>
              <button
                onClick={onPrevAyah}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
              >
                <SkipForward className="w-4 h-4" strokeWidth={1.85} />
              </button>

              <button
                onClick={() => isPlaying ? onPause() : onPlay()}
                className="w-8 h-8 rounded-xl border border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" strokeWidth={1.85} />
                ) : (
                  <Play className="w-4 h-4" strokeWidth={1.85} />
                )}
              </button>

              <button
                onClick={onNextAyah}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-all cursor-pointer"
              >
                <SkipBack className="w-4 h-4" strokeWidth={1.85} />
              </button>

              <button
                onClick={cycleRepeat}
                className={`hidden sm:flex items-center gap-1 h-7 px-2 rounded-lg border text-[11px] font-app font-bold transition-all cursor-pointer ${
                  repeatCount > 1 || repeatCount === Infinity
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-300/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
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
                onClick={cycleSpeed}
                className="hidden sm:flex items-center gap-1 h-7 px-2 rounded-lg border border-slate-300/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 text-[11px] font-app font-bold transition-colors cursor-pointer"
              >
                <Gauge className="w-3.5 h-3.5" strokeWidth={1.85} />
                <span>{playbackRate}x</span>
              </button>
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Current Surah/Ayah or Hadith Info            */}
        {/* ======================================================== */}
        <div dir="rtl" className="flex items-center gap-2.5 min-w-0 justify-self-end">
          {activeMode === 'hadith' && !isPlaying ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
              <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
              <span>{currentHadithBook?.name_urdu || 'کتبِ حدیث'}</span>
              {currentHadithChapter && (
                <span className="text-slate-500 dark:text-slate-400 font-app text-[11px] truncate max-w-[140px] hidden sm:inline-block">
                  ({currentHadithChapter.title_arabic || currentHadithChapter.title_english})
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>سورة {currentSurah?.name_arabic || 'الفاتحة'}</span>
                <span className="text-slate-500 dark:text-slate-400 font-app text-[11px] font-bold">
                  {currentAyah ? `(${currentAyah.ayah_number})` : ''}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded-lg bg-slate-200/65 dark:bg-slate-800/75 border border-slate-300/50 dark:border-slate-700/50">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.85} />
                <span>مشاری راشد العفاسی</span>
              </div>
            </>
          )}
        </div>

      </div>
    </footer>
  );
};
