import Replicate from 'replicate';
import { createClient } from '@/lib/supabase/server';
import { MUSIC_BUCKET, MUSIC_COLUMNS, buildTracks, type MusicRow } from '@/lib/music';

// Music generation can involve a model cold start, so give it plenty of room.
// (Only enforced by deploy platforms; local dev is unbounded.)
export const maxDuration = 300;

// The Replicate client reads REPLICATE_API_TOKEN from the environment.
const replicate = new Replicate();

const ACE_STEP =
  'fishaudio/ace-step-1.5:74e3a7d383b18815e277de5223f5fe9d53d38832de15aa567fe729fa129d0d85';

// Mirror the model schema's hard limits so we never send rejected input.
const MAX_PROMPT = 512;
const MAX_LYRICS = 4096;
const MIN_DURATION = 1;
const MAX_DURATION = 600;
const MIN_BATCH = 1;
const MAX_BATCH = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export async function POST(request: Request) {
  // Only signed-in users may spend generation credits.
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

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT) {
    return Response.json(
      { error: `Prompt must be ${MAX_PROMPT} characters or fewer.` },
      { status: 400 }
    );
  }

  // Lyrics default to an instrumental marker, matching the model's own default.
  const rawLyrics = typeof body.lyrics === 'string' ? body.lyrics.trim() : '';
  const lyrics = rawLyrics ? rawLyrics.slice(0, MAX_LYRICS) : '[Instrumental]';

  // Duration in seconds (UI offers 60/120/180); fall back to 60s.
  const duration =
    typeof body.duration === 'number' && Number.isFinite(body.duration)
      ? clamp(Math.round(body.duration), MIN_DURATION, MAX_DURATION)
      : 60;

  // Number of songs to generate in parallel (1-4).
  const batchSize =
    typeof body.batch_size === 'number' && Number.isFinite(body.batch_size)
      ? clamp(Math.round(body.batch_size), MIN_BATCH, MAX_BATCH)
      : 1;

  try {
    const output = await replicate.run(ACE_STEP, {
      input: {
        prompt,
        lyrics,
        duration,
        batch_size: batchSize,
      },
    });

    // ace-step returns one file output per requested song. Normalise to an array
    // so batch and single generations follow the same path.
    const files = Array.isArray(output) ? output : [output];
    const replicateUrls = files.map((file) =>
      file && typeof (file as { url?: unknown }).url === 'function'
        ? (file as { url: () => URL }).url().toString()
        : String(file)
    );

    const title = prompt.length > 80 ? `${prompt.slice(0, 80)}…` : prompt;
    const rows: MusicRow[] = [];

    for (const replicateUrl of replicateUrls) {
      // Replicate URLs are temporary — pull the bytes and persist them ourselves.
      const audioResponse = await fetch(replicateUrl);
      if (!audioResponse.ok) {
        throw new Error('Failed to download the generated audio.');
      }
      const audioBuffer = await audioResponse.arrayBuffer();

      // Store under the user's folder so storage RLS (`{uid}/...`) is satisfied.
      const musicId = crypto.randomUUID();
      const audioPath = `${user.id}/${musicId}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from(MUSIC_BUCKET)
        .upload(audioPath, audioBuffer, { contentType: 'audio/mpeg', upsert: false });
      if (uploadError) {
        throw uploadError;
      }

      const { data: row, error: insertError } = await supabase
        .from('musics')
        .insert({
          id: musicId,
          user_id: user.id,
          title,
          prompt,
          audio_path: audioPath,
          duration_seconds: duration,
        })
        .select(MUSIC_COLUMNS)
        .single<MusicRow>();
      if (insertError || !row) {
        throw insertError ?? new Error('Failed to save the track.');
      }
      rows.push(row);
    }

    const tracks = await buildTracks(supabase, rows);
    return Response.json({ tracks });
  } catch (err) {
    console.error('music generation failed:', err);

    // Surface actionable Replicate errors (e.g. billing) instead of a generic message.
    const status =
      err && typeof (err as { response?: { status?: number } }).response?.status === 'number'
        ? (err as { response: { status: number } }).response.status
        : 500;
    const message = err instanceof Error ? err.message : '';

    if (status === 402 || /insufficient credit/i.test(message)) {
      return Response.json(
        {
          error:
            'Replicate account has no credit. Add billing at replicate.com/account/billing, then try again.',
        },
        { status: 402 }
      );
    }
    if (status === 401) {
      return Response.json(
        { error: 'Replicate authentication failed. Check REPLICATE_API_TOKEN.' },
        { status: 401 }
      );
    }

    return Response.json({ error: 'Generation failed. Please try again.' }, { status: 500 });
  }
}
