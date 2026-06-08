'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { WorkspaceNavbar } from '@/components/workspace/navbar';
import { PromptInputBox, type GenerateOptions } from '@/components/workspace/prompt-input-box';
import { MusicList } from '@/components/workspace/music-list';
import { Modal } from '@/components/ui/modal';
import { MusicPlayer, type MusicPlayerHandle } from '@/components/workspace/music-player';
import { LoadingLines } from '@/components/workspace/loading-lines';
import { cn } from '@/lib/utils';
import type { Track } from '@/lib/music';

export default function WorkspacePage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef<MusicPlayerHandle>(null);

    // Rename dialog state — the track being renamed and its draft title.
    const [renameTarget, setRenameTarget] = useState<Track | null>(null);
    const [renameDraft, setRenameDraft] = useState('');

    // Navbar search — filters the rendered list by the track's display name.
    const [search, setSearch] = useState('');

    // Clicking the active track toggles play/pause; any other track switches to it.
    const handleSelect = (trackId: string) => {
        if (trackId === currentTrackId) playerRef.current?.toggle();
        else setCurrentTrackId(trackId);
    };

    useEffect(() => {
        // Once the session is resolved, bounce visitors who aren't signed in.
        if (!loading && !user) {
            router.replace('/auth');
        }
    }, [loading, user, router]);

    // Load the user's existing tracks once we have a session.
    useEffect(() => {
        if (!user) return;
        let active = true;
        fetch('/api/musics')
            .then((res) => (res.ok ? res.json() : Promise.reject(res)))
            .then((data) => {
                if (active) setTracks(data.tracks ?? []);
            })
            .catch(() => {
                /* Non-fatal — the list just stays empty. */
            });
        return () => {
            active = false;
        };
    }, [user]);

    const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);
    const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : null;

    // Tracks are newest-first: "previous" is newer (up), "next" is older (down).
    const goPrev = useCallback(() => {
        setCurrentTrackId((id) => {
            const i = tracks.findIndex((t) => t.id === id);
            return i > 0 ? tracks[i - 1].id : id;
        });
    }, [tracks]);

    const goNext = useCallback(() => {
        setCurrentTrackId((id) => {
            const i = tracks.findIndex((t) => t.id === id);
            return i >= 0 && i < tracks.length - 1 ? tracks[i + 1].id : id;
        });
    }, [tracks]);

    // Hold the page blank until we know whether there's a session.
    if (loading || !user) {
        return <main className="min-h-screen w-full bg-[#171717]" />;
    }

    const handleSend = async (message: string, options: GenerateOptions) => {
        const prompt = message.trim();
        if (!prompt || isGenerating) return;

        setIsGenerating(true);
        setError(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    lyrics: options.lyrics,
                    duration: options.duration,
                    batch_size: options.batchSize,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Generation failed');
            }
            const newTracks = (data.tracks ?? []) as Track[];
            if (newTracks.length === 0) {
                throw new Error('No tracks were generated.');
            }
            setTracks((prev) => [...newTracks, ...prev]);
            // Auto-play the first freshly generated track.
            setCurrentTrackId(newTracks[0].id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    // Open the rename dialog seeded with the track's current name.
    const handleRename = (track: Track) => {
        setRenameTarget(track);
        setRenameDraft(track.title || track.prompt);
    };

    const submitRename = async () => {
        const target = renameTarget;
        const title = renameDraft.trim();
        if (!target || !title) return;
        setRenameTarget(null);
        // Optimistically update; revert is unnecessary since a failure just
        // surfaces the old title on the next list reload.
        setTracks((prev) => prev.map((t) => (t.id === target.id ? { ...t, title } : t)));
        try {
            await fetch(`/api/musics/${target.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
        } catch {
            /* Non-fatal — the optimistic title stays until the next reload. */
        }
    };

    const handleDelete = async (track: Track) => {
        // Drop it from the list immediately; close the player if it was active.
        setTracks((prev) => prev.filter((t) => t.id !== track.id));
        setCurrentTrackId((id) => (id === track.id ? null : id));
        try {
            await fetch(`/api/musics/${track.id}`, { method: 'DELETE' });
        } catch {
            /* Non-fatal — the row is already gone from the UI. */
        }
    };

    const handleDownload = async (track: Track) => {
        if (!track.audioUrl) return;
        try {
            const res = await fetch(track.audioUrl);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(track.title || track.prompt || 'track').slice(0, 80)}.mp3`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            setError('Download failed. Please try again.');
        }
    };

    // Filter the rendered list by the search query, matching the displayed name
    // (title, falling back to prompt). Playback still operates on the full list.
    const query = search.trim().toLowerCase();
    const visibleTracks = query
        ? tracks.filter((t) => (t.title || t.prompt || '').toLowerCase().includes(query))
        : tracks;

    const isEmpty = tracks.length === 0 && !isGenerating && !error;
    const noResults = query !== '' && visibleTracks.length === 0 && tracks.length > 0;
    const hasPlayer = currentTrack !== null;

    return (
        <main className="relative flex min-h-screen w-full flex-col bg-[#171717] font-sans text-white">
            <WorkspaceNavbar search={search} onSearchChange={setSearch} />

            {/* Center content area — the user's track list */}
            <div
                className={cn(
                    'flex-1 overflow-y-auto px-4 pt-6',
                    hasPlayer ? 'pb-56' : 'pb-44'
                )}
            >
                <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4">
                    {isGenerating && <LoadingLines />}

                    {error && (
                        <div className="flex flex-col items-center gap-2 text-red-400">
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                <line x1="6" y1="6" x2="18" y2="18" />
                                <line x1="18" y1="6" x2="6" y2="18" />
                            </svg>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <MusicList
                        tracks={visibleTracks}
                        currentTrackId={currentTrackId}
                        isPlaying={isPlaying}
                        onSelect={handleSelect}
                        onRename={handleRename}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                    />

                    {noResults && (
                        <p className="mt-12 text-sm text-gray-400">
                            “{search.trim()}”와(과) 일치하는 음악이 없습니다.
                        </p>
                    )}

                    {isEmpty && (
                        <div className="mt-24">
                            <LoadingLines
                                text="Describe a track below to generate your first song."
                                speed={2}
                                color="#C9A961"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Prompt box — pinned to the bottom, lifted above the player when present */}
            <div
                className={cn(
                    'pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4',
                    hasPlayer ? 'bottom-24' : 'bottom-6'
                )}
            >
                <div className="pointer-events-auto w-full max-w-2xl">
                    <PromptInputBox
                        onSend={handleSend}
                        isLoading={isGenerating}
                        placeholder="Describe the music you want to create…"
                    />
                </div>
            </div>

            {/* Global music player */}
            <MusicPlayer
                ref={playerRef}
                track={currentTrack}
                onPrev={goPrev}
                onNext={goNext}
                hasPrev={currentIndex > 0}
                hasNext={currentIndex >= 0 && currentIndex < tracks.length - 1}
                onPlayingChange={setIsPlaying}
                onClose={() => setCurrentTrackId(null)}
            />

            {/* Rename dialog */}
            <Modal
                open={renameTarget !== null}
                onOpenChange={(open) => !open && setRenameTarget(null)}
                title="이름 변경"
            >
                <input
                    autoFocus
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            submitRename();
                        }
                    }}
                    placeholder="트랙 이름"
                    className="w-full rounded-xl border border-[#333333] bg-[#171717] px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:border-[#9b87f5] focus-visible:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setRenameTarget(null)}
                        className="h-8 rounded-md px-3 text-sm text-gray-300 transition-colors hover:bg-[#3A3A40]"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={submitRename}
                        disabled={!renameDraft.trim()}
                        className="h-8 rounded-md bg-white px-3 text-sm font-medium text-black transition-colors hover:bg-white/80 disabled:opacity-50"
                    >
                        저장
                    </button>
                </div>
            </Modal>
        </main>
    );
}
