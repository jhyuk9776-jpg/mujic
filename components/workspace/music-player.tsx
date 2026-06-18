'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Music,
  X,
} from 'lucide-react';
import type { Track } from '@/lib/music';

interface MusicPlayerProps {
  track: Track | null;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  /** Jump back to the first track in the queue (used by "repeat all" at the end). */
  onRestart?: () => void;
  onPlayingChange?: (playing: boolean) => void;
  onClose?: () => void;
}

// Repeat behaviour, cycled by the repeat button (Spotify / YouTube Music style):
//   off → play through the queue and stop at the end
//   all → at the end of the queue, wrap back to the first track
//   one → repeat the current track indefinitely
type RepeatMode = 'off' | 'all' | 'one';
const REPEAT_ORDER: Record<RepeatMode, RepeatMode> = { off: 'all', all: 'one', one: 'off' };
const REPEAT_LABEL: Record<RepeatMode, string> = {
  off: 'Repeat: off',
  all: 'Repeat: all',
  one: 'Repeat: one',
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Shared accent — the muted antique gold used across the workspace.
const GOLD = '#C9A961';

function fill(percent: number, filled = GOLD, rest = '#4d4d4d') {
  const p = Math.max(0, Math.min(100, percent));
  return { background: `linear-gradient(to right, ${filled} ${p}%, ${rest} ${p}%)` };
}

export interface MusicPlayerHandle {
  toggle: () => void;
}

export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(function MusicPlayer(
  { track, onNext, onPrev, hasNext = false, hasPrev = false, onRestart, onPlayingChange, onClose },
  ref
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // "Repeat one" is handled by the element's native loop so the track restarts
  // seamlessly (no `ended` event fires); the other modes are handled in onEnded.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.loop = repeatMode === 'one';
  }, [repeatMode, track?.id]);

  // Autoplay whenever the selected track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;
    setCurrentTime(0);
    audio.load();
    audio.play().catch(() => {
      /* Autoplay may be blocked until the user interacts — stay paused. */
    });
  }, [track?.id, track?.audioUrl]);

  // Stop playback when the player unmounts (e.g. navigating to another screen).
  // A removed-but-detached <audio> element keeps playing in the background until
  // it's explicitly paused, so pause it here to stop the sound on navigation.
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  // Mirror volume/mute onto the element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // Report play state to the parent (keeps the list's icons in sync).
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  // Toggle play/pause by reading the element directly, so it stays correct
  // regardless of render timing (used by the button and the imperative handle).
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  // Let the parent (e.g. the music list) drive play/pause of the active track.
  useImperativeHandle(ref, () => ({ toggle: togglePlay }), [togglePlay]);

  if (!track) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const seekPercent = duration ? (currentTime / duration) * 100 : 0;
  const volPercent = (muted ? 0 : volume) * 100;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex h-20 items-center bg-[#1C1A14] px-4">
      <audio
        ref={audioRef}
        src={track.audioUrl ?? undefined}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          // "Repeat one" never reaches here (native loop). For the rest: advance
          // to the next track, and on "repeat all" wrap to the start at the end.
          if (hasNext) {
            onNext?.();
          } else if (repeatMode === 'all') {
            onRestart?.();
          } else {
            setIsPlaying(false);
          }
        }}
      />

      {/* Seek bar — flush with the player's top edge */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={handleSeek}
        style={fill(seekPercent)}
        className="player-range player-range--seek absolute inset-x-0 top-0"
        aria-label="Seek"
      />

      <div className="flex w-full items-center gap-4">
        {/* Track info — pinned to the left edge */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#C9A961]/15">
            <Music className="h-5 w-5 text-[#C9A961]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-gray-100">{track.title || track.prompt}</p>
            <p className="text-xs tabular-nums text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous track"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px] fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next track"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
          {/* Repeat — cycles off → all → one (Spotify / YouTube Music style). */}
          <button
            type="button"
            onClick={() => setRepeatMode((m) => REPEAT_ORDER[m])}
            className="relative transition-colors hover:text-white"
            style={{ color: repeatMode === 'off' ? undefined : GOLD }}
            aria-label={REPEAT_LABEL[repeatMode]}
            title={REPEAT_LABEL[repeatMode]}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="h-5 w-5" />
            ) : (
              <Repeat className={repeatMode === 'off' ? 'h-5 w-5 text-gray-300' : 'h-5 w-5'} />
            )}
            {/* Active-state dot, matching Spotify's repeat indicator. */}
            {repeatMode !== 'off' && (
              <span
                className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: GOLD }}
              />
            )}
          </button>
        </div>

        {/* Volume + close */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="text-gray-300 transition-colors hover:text-white"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
              style={fill(volPercent)}
              className="player-range w-24"
              aria-label="Volume"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 transition-colors hover:text-white"
            aria-label="Close player"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
});

MusicPlayer.displayName = 'MusicPlayer';
