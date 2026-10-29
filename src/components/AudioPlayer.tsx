import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward, SkipBack, SkipForward, X } from 'lucide-react';
import { Ayah } from '../types/quran';

interface AudioPlayerProps {
  currentAyah: Ayah | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onWordTimeUpdate: (wordIndex: number | null) => void;
  onClose: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentAyah,
  isPlaying,
  onPlay,
  onPause,
  onNextAyah,
  onPrevAyah,
  onWordTimeUpdate,
  onClose
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentRepeat, setCurrentRepeat] = useState(1);

  useEffect(() => {
    if (!audioRef.current || !currentAyah?.audio_url) return;

    audioRef.current.src = currentAyah.audio_url;
    audioRef.current.playbackRate = playbackRate;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentAyah?.audio_url]);

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
    const timeSec = audioRef.current.currentTime;
    const timeMs = timeSec * 1000;
    setCurrentTime(timeSec);

    // Sync active word index based on segments [[word_idx, word_seq, start_ms, end_ms], ...]
    if (currentAyah?.audio_segments && currentAyah.audio_segments.length > 0) {
      const match = currentAyah.audio_segments.find(
        seg => timeMs >= seg[2] && timeMs <= seg[3]
      );
      if (match) {
        onWordTimeUpdate(match[0]);
      } else {
        onWordTimeUpdate(null);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (currentRepeat < repeatCount) {
      setCurrentRepeat(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      setCurrentRepeat(1);
      onNextAyah();
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  if (!currentAyah) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
        
        {/* Reciter Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-emerald-400 truncate font-mono">
              آیت {currentAyah.verse_key}
            </div>
            <div className="text-xs text-slate-300 truncate">
              مشاری راشد العفاسی (Mishary Alafasy)
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevAyah}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Previous Ayah"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={onNextAyah}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Next Ayah"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Looping Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Playback Speed Selector */}
          <select
            value={playbackRate}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
            title="Playback Speed"
          >
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>

          {/* Repeat Looping Selector */}
          <select
            value={repeatCount}
            onChange={(e) => setRepeatCount(parseInt(e.target.value, 10))}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
            title="Repeat Ayah"
          >
            <option value="1">تکرار: 1 بار</option>
            <option value="3">تکرار: 3 بار</option>
            <option value="5">تکرار: 5 بار</option>
          </select>

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
