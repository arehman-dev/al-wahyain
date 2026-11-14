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
      className="fixed bottom-0 left-0 right-0 z-40 h-10 glass-bar border-t px-3 sm:px-6 font-ibm select-none transition-all flex items-center"
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
        className={`absolute top-0 left-0 right-0 h-0.5 hover:h-1.5 transition-all duration-150 cursor-pointer group z-30 ${
          currentAyah?.audio_url ? 'bg-slate-300/40 dark:bg-slate-700/40' : 'hidden'
        }`}
        title={duration > 0 ? `${formatTime(currentTime)} / ${formatTime(duration)} (Click to seek)` : undefined}
      >
        <div 
          className="h-full bg-[#2ca4ab] group-hover:bg-[#258c91] transition-[width] duration-75 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <span className="opacity-0 group-hover:opacity-100 absolute -right-1 -top-1 w-2.5 h-2.5 bg-[#2ca4ab] rounded-full transition-opacity duration-150 border border-white dark:border-slate-900" />
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
            title={isZenMode ? "Exit Zen Mode [Z / Esc]" : "Zen Mode [Z]"}
            aria-label="Zen Mode"
            className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer relative ${
              isZenMode ? 'btn-bar btn-bar-active' : 'btn-bar'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
            {isZenMode && <span className="micro-dot" />}
          </button>

          {/* 2. Search */}
          <button
            onClick={onOpenSearch}
            title="Quran Search [Ctrl+K]"
            aria-label="Quran Search"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar hover:border-[#2ca4ab] hover:text-[#0e7490] dark:hover:text-[#2ca4ab] transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          {/* 3. Share */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              title="Export & Share Ayah"
              aria-label="Share Ayah"
              className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar hover:border-[#2ca4ab] hover:text-[#0e7490] dark:hover:text-[#2ca4ab] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}

          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* 4. Horizontal Padding Slider */}
          <div className="btn-bar h-[26px] flex items-center gap-1.5 rounded-md px-2 py-0.5">
            <button
              onClick={() => setShowPaddingSlider(prev => !prev)}
              title="Horizontal Margin Padding"
              aria-label="Margin Width"
              className="text-slate-600 dark:text-slate-300 hover:text-[#2ca4ab] transition-colors cursor-pointer flex items-center"
            >
              <MoveHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
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
                  className="w-16 md:w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2ca4ab]"
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
            title="Repeat"
            className={`hidden sm:flex items-center justify-center gap-1 h-[26px] px-2 min-w-[42px] rounded-md text-[11px] font-app font-bold transition-colors cursor-pointer relative ${
              !currentAyah
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : repeatCount > 1 || repeatCount === Infinity
                ? 'btn-bar btn-bar-active'
                : 'btn-bar'
            }`}
          >
            <Repeat className="w-3 h-3" strokeWidth={1.75} />
            <span>
              {repeatCount === Infinity 
                ? `∞` 
                : repeatCount > 1 
                ? `${currentRepeat}/${repeatCount}` 
                : '1x'}
            </span>
            {(repeatCount > 1 || repeatCount === Infinity) && <span className="micro-dot" />}
          </button>

          <button
            onClick={onPrevAyah}
            title={navArrowMode === 'rtl' ? 'پچھلی آیت [→ / K]' : 'پچھلی آیت [← / J]'}
            aria-label="Previous Ayah"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar hover:border-[#2ca4ab] hover:text-[#2ca4ab] transition-colors cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          {/* Focal Centerpiece: Play / Pause Button in Quran Foundation Blue Circular Disc */}
          <button
            onClick={() => isPlaying ? onPause() : onPlay()}
            disabled={!currentAyah}
            title={!currentAyah ? 'Audio not available for 0-intro' : isPlaying ? 'Pause [Space]' : 'Play [Space]'}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
              !currentAyah 
                ? 'border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed' 
                : 'bg-[#2ca4ab] text-white hover:bg-[#258c91] active:scale-95 shadow-xs cursor-pointer'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-white" strokeWidth={2} />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white translate-x-[0.5px]" strokeWidth={2} />
            )}
          </button>

          {/* Left Flank (in RTL): Next Ayah & Playback Speed */}
          <button
            onClick={onNextAyah}
            title={navArrowMode === 'rtl' ? 'اگلی آیت [← / J]' : 'اگلی آیت [→ / K]'}
            aria-label="Next Ayah"
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center btn-bar hover:border-[#2ca4ab] hover:text-[#2ca4ab] transition-colors cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>

          <button
            onClick={cycleSpeed}
            disabled={!currentAyah}
            title="Playback Speed"
            className={`hidden sm:flex items-center justify-center gap-1 h-[26px] px-2 min-w-[42px] rounded-md text-[11px] font-app font-bold transition-colors cursor-pointer ${
              !currentAyah
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'btn-bar hover:border-[#2ca4ab] hover:text-[#2ca4ab]'
            }`}
          >
            <Gauge className="w-3 h-3" strokeWidth={1.75} />
            <span>{playbackRate}x</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: Current Surah/Ayah & Reciter Info            */}
        {/* ======================================================== */}
        <div dir="rtl" className="flex items-center gap-2.5 min-w-0 justify-end z-10 shrink-0">
          {/* Subtle Audio Duration Indicator */}
          {duration > 0 && currentAyah && (
            <span dir="ltr" className="btn-bar hidden lg:inline-flex items-center text-[10px] font-mono font-medium tabular-nums px-1.5 h-[22px] rounded">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isPlaying ? 'bg-[#2ca4ab] animate-pulse' : 'bg-slate-400'}`} />
            <span>سورة {currentSurah?.name_arabic || 'الفاتحة'}</span>
            {currentAyah ? (
              <span className="text-slate-500 dark:text-slate-400 font-app text-[11px] font-bold">
                ({currentAyah.ayah_number})
              </span>
            ) : (
              <span className="text-[#2ca4ab] font-mono text-[11px] font-bold">
                (0-intro)
              </span>
            )}
          </div>

          <div className="btn-bar hidden md:flex items-center gap-1.5 text-[11px] font-medium px-2 h-[26px] rounded-md">
            <Volume2 className="w-3.5 h-3.5 text-[#2ca4ab]" strokeWidth={1.75} />
            <span>مشاری راشد العفاسی</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
