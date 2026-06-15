'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

// Only the audio source matters now — titles and descriptions are intentionally gone.
// Each button gets a slightly different size and a gentle vertical offset so the trio
// feels hand-placed rather than a rigid, uniform row.
interface Track {
  src: string;
  size: string;
  iconSize: string;
  offset: string;
}

const tracks: Track[] = [
  { src: '/music/1.mp3', size: 'h-20 w-20 md:h-24 md:w-24', iconSize: 'h-7 w-7 md:h-8 md:w-8', offset: 'md:-translate-y-7' },
  { src: '/music/2.mp3', size: 'h-28 w-28 md:h-36 md:w-36', iconSize: 'h-9 w-9 md:h-11 md:w-11', offset: 'md:translate-y-5' },
  { src: '/music/3.mp3', size: 'h-24 w-24 md:h-28 md:w-28', iconSize: 'h-8 w-8 md:h-9 md:w-9', offset: 'md:-translate-y-2' },
];

interface PlayButtonProps {
  track: Track;
  index: number;
  isActive: boolean;
  onPlay: () => void;
}

function PlayButton({ track, index, isActive, onPlay }: PlayButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Only one button may play at a time — pause when another takes over.
  useEffect(() => {
    if (!isActive && isPlaying) {
      audioRef.current?.pause();
    }
  }, [isActive, isPlaying]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      onPlay();
      void audio.play();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease, delay: 0.12 * index }}
      className={cn('relative', track.offset)}
    >
      {/* Soft ring that ripples outward while playing */}
      {isPlaying && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full border border-white/40"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 1.7 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      <button
        onClick={toggle}
        aria-label={isPlaying ? '일시정지' : '재생'}
        className={cn(
          'group relative flex items-center justify-center rounded-full border backdrop-blur-2xl transition-all duration-500 active:scale-95',
          track.size,
          isPlaying
            ? 'border-white/40 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_20px_50px_-15px_rgba(255,255,255,0.25)]'
            : 'border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_24px_60px_-20px_rgba(0,0,0,0.7)] hover:border-white/30 hover:bg-white/10'
        )}
      >
        {isPlaying ? (
          <Pause className={cn('text-white', track.iconSize)} />
        ) : (
          <Play className={cn('ml-1 text-white', track.iconSize)} />
        )}
      </button>

      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </motion.div>
  );
}

export function ExampleSection() {
  // Index of the button currently allowed to play; -1 = none.
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <section
      id="example"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-8 py-24 font-sans md:px-12"
    >
      {/* Soft monochrome halo for depth */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] blur-[150px]" />

      {/* Just the play buttons, centered on screen with subtle staggered heights */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-10 md:gap-16">
        {tracks.map((track, i) => (
          <PlayButton
            key={track.src}
            track={track}
            index={i}
            isActive={activeIndex === i}
            onPlay={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
