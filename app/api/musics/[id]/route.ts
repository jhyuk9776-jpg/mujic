import { createClient } from '@/lib/supabase/server';
import { MUSIC_BUCKET, MUSIC_COLUMNS, buildTracks, type MusicRow } from '@/lib/music';

const MAX_TITLE = 200;

// Rename a track. RLS (`auth.uid() = user_id`) already scopes this to the owner.
export async function PATCH(request: Request, ctx: RouteContext<'/api/musics/[id]'>) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return Response.json({ error: 'Title is required' }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from('musics')
    .update({ title: title.slice(0, MAX_TITLE) })
    .eq('id', id)
    .eq('user_id', user.id)
    .select(MUSIC_COLUMNS)
    .single<MusicRow>();
  if (error || !row) {
    return Response.json({ error: 'Track not found' }, { status: 404 });
  }

  const [track] = await buildTracks(supabase, [row]);
  return Response.json({ track });
}

// Delete a track: remove its stored audio, then the row.
export async function DELETE(_request: Request, ctx: RouteContext<'/api/musics/[id]'>) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Look up the audio path first so we can clean up storage.
  const { data: row } = await supabase
    .from('musics')
    .select('audio_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single<{ audio_path: string | null }>();
  if (!row) {
    return Response.json({ error: 'Track not found' }, { status: 404 });
  }

  if (row.audio_path) {
    // Best-effort: a missing object shouldn't block deleting the row.
    await supabase.storage.from(MUSIC_BUCKET).remove([row.audio_path]);
  }

  const { error: deleteError } = await supabase
    .from('musics')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (deleteError) {
    return Response.json({ error: 'Failed to delete the track.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
