import { createClient } from '@/lib/supabase/server';
import { MUSIC_COLUMNS, buildTracks, type MusicRow } from '@/lib/music';

// Lists the signed-in user's tracks, newest first, with signed playback URLs.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('musics')
    .select(MUSIC_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<MusicRow[]>();
  if (error) {
    console.error('failed to load musics:', error);
    return Response.json({ error: 'Failed to load musics' }, { status: 500 });
  }

  const tracks = await buildTracks(supabase, data ?? []);
  return Response.json({ tracks });
}
