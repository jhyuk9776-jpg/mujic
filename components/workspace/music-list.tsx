'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Play, Pause, MoreVertical, Pencil, Download, Trash2 } from 'lucide-react';
import type { Track } from '@/lib/music';
import { cn } from '@/lib/utils';

interface MusicListProps {
  tracks: Track[];
  currentTrackId?: string | null;
  isPlaying?: boolean;
  onSelect?: (trackId: string) => void;
  onRename?: (track: Track) => void;
  onDownload?: (track: Track) => void;
  onDelete?: (track: Track) => void;
}

// The user's generated tracks. Clicking a row loads it into the bottom player;
// the trailing ⋯ menu manages the track (rename / download / delete).
export function MusicList({
  tracks,
  currentTrackId,
  isPlaying,
  onSelect,
  onRename,
  onDownload,
  onDelete,
}: MusicListProps) {
  if (tracks.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      {tracks.map((track) => {
        const active = track.id === currentTrackId;
        const showPause = active && isPlaying;

        return (
          <div
            key={track.id}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl border-none px-4 py-3 transition-colors',
              active
                ? 'bg-[#C9A961]/15'
                : 'bg-[#C9A961]/[0.05] hover:bg-[#C9A961]/10'
            )}
          >
            <button
              type="button"
              onClick={() => onSelect?.(track.id)}
              disabled={!track.audioUrl}
              className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md',
                  active ? 'bg-[#C9A961]/25' : 'bg-[#C9A961]/10'
                )}
              >
                {showPause ? (
                  <Pause className="h-4 w-4 fill-current text-[#C9A961]" />
                ) : (
                  <Play className="h-4 w-4 translate-x-[1px] fill-current text-[#C9A961]" />
                )}
              </div>
              <p
                className={cn(
                  'min-w-0 flex-1 truncate text-sm',
                  active ? 'text-white' : 'text-gray-200'
                )}
              >
                {track.title || track.prompt}
              </p>
            </button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label="Track options"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 outline-none transition-colors hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={4}
                  className="z-50 min-w-[160px] overflow-hidden rounded-xl border border-[#333333] bg-[#1F2023] p-1 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                >
                  <DropdownMenu.Item
                    onSelect={() => onRename?.(track)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none transition-colors focus:bg-white/10 data-[highlighted]:bg-white/10"
                  >
                    <Pencil className="h-4 w-4" />
                    이름 변경
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    disabled={!track.audioUrl}
                    onSelect={() => onDownload?.(track)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none transition-colors focus:bg-white/10 data-[highlighted]:bg-white/10 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
                  >
                    <Download className="h-4 w-4" />
                    다운로드
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-[#333333]" />
                  <DropdownMenu.Item
                    onSelect={() => onDelete?.(track)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 outline-none transition-colors focus:bg-red-500/10 data-[highlighted]:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        );
      })}
    </div>
  );
}
