import type { SupabaseClient } from '@supabase/supabase-js';

// Private bucket — playback requires short-lived signed URLs.
export const MUSIC_BUCKET = 'musics';
export const SIGNED_URL_TTL = 60 * 60 * 8; // 8 hours

// Shape of a row selected from `public.musics`.
export interface MusicRow {
  id: string;
  title: string | null;
  prompt: string;
  audio_path: string | null;
  duration_seconds: number | null;
  created_at: string;
}

// Client-facing track, with a ready-to-play signed audio URL.
export interface Track {
  id: string;
  title: string | null;
  prompt: string;
  audioUrl: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

// Columns to select when building tracks.
export const MUSIC_COLUMNS = 'id, title, prompt, audio_path, duration_seconds, created_at';

// Turn DB rows into client tracks, signing every audio path in one batch.
export async function buildTracks(
  supabase: SupabaseClient,
  rows: MusicRow[]
): Promise<Track[]> {
  const paths = rows
    .map((row) => row.audio_path)
    .filter((path): path is string => Boolean(path));

  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from(MUSIC_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    }
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    prompt: row.prompt,
    audioUrl: row.audio_path ? signed.get(row.audio_path) ?? null : null,
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
  }));
}
