import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Gauge, 
  Volume2,
  Bookmark,
  FileText,
  Search,
  Maximize2
} from 'lucide-react';
import { Ayah, Surah } from '../types/quran';

interface BottomDockProps {
  currentSurah: Surah | undefined;
  currentAyah: Ayah | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onWordTimeUpdate: (wordIndex: number | null) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  hasNote: boolean;
  onOpenNoteDrawer: () => void;
  onOpenSearch: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
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
  isBookmarked,
  onToggleBookmark,
  hasNote,
  onOpenNoteDrawer,
  onOpenSearch,
  isZenMode,
  onToggleZenMode
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
    const counts = [1, 3, 5, Infinity];
    const nextIdx = (counts.indexOf(repeatCount) + 1) % counts.length;
    const nextCount = counts[nextIdx];
    setRepeatCount(nextCount);
    setCurrentRepeat(1);
  };

  return (
    <footer 
      dir="rtl"
      className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl sm:max-w-2xl w-[94%] sm:w-auto px-4 py-1.5 bg-white/92 dark:bg-slate-900/92 backdrop-blur-xl rounded-full border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-900/10 flex items-center justify-between gap-3 sm:gap-5 font-ibm select-none transition-all"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Right Side: Global Reciter & Now Playing Ayah Details */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{currentSurah?.name_arabic || 'سورۃ'}</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {currentAyah ? `(آیت ${currentAyah.ayah_number})` : ''}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
          <Volume2 className="w-3 h-3 text-emerald-600" />
          <span>العفاسی</span>
        </div>
      </div>

      {/* Center: Global Audio Player Stepper & Playback Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onPrevAyah}
          title="پچھلی آیت"
          className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={() => isPlaying ? onPause() : onPlay()}
          title={isPlaying ? "تلاوت موقوف کریں (Space)" : "تلاوت شروع کریں (Space)"}
          className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current mr-0.5" />}
        </button>

        <button
          onClick={onNextAyah}
          title="اگلی آیت"
          className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={cycleRepeat}
          title={repeatCount === 1 ? "تکرار برائے حفظ (Repeat Loop)" : `دور تکرار: ${currentRepeat} از ${repeatCount === Infinity ? 'لامحدود' : repeatCount}`}
          className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold transition-all ${
            repeatCount > 1 || repeatCount === Infinity
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/50 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Repeat className="w-3 h-3" />
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
          title="رفتار تلاوت (Speed)"
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-mono font-bold transition-colors"
        >
          <Gauge className="w-3 h-3" />
          <span>{playbackRate}x</span>
        </button>
      </div>

      {/* Left Side: Essential Global Study Tools (Bookmark, Notes, Zen) */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggleBookmark}
          title={isBookmarked ? "محفوظ فہرست سے نکالیں" : "آیت محفوظ کریں"}
          className={`p-1.5 rounded-full transition-all ${
            isBookmarked
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-500'
              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={onOpenNoteDrawer}
          title="ذاتی تفسیری نوٹ"
          className={`p-1.5 rounded-full transition-all ${
            hasNote
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
              : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleZenMode}
          title="فوکس / زین موڈ (Z)"
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
