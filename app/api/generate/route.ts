import Replicate from 'replicate';
import { createClient } from '@/lib/supabase/server';
import { MUSIC_BUCKET, MUSIC_COLUMNS, buildTracks, type MusicRow } from '@/lib/music';
import { creditCost } from '@/lib/credits';

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

  // Charge credits up front (longer tracks and bigger batches cost more). The
  // RPC deducts atomically and returns NULL when the balance is too low.
  //
  // NOTE (known limitation): spend_credits / refund_credits are exposed to the
  // `authenticated` role so this route can call them with the user session. That
  // means a user could call refund_credits directly to mint credits. Acceptable
  // pre-launch; before wiring real payments, move these mutations behind a
  // service-role client and revoke EXECUTE from `authenticated`.
  const cost = creditCost(duration, batchSize);
  const { data: balanceAfterSpend, error: spendError } = await supabase.rpc('spend_credits', {
    p_amount: cost,
  });
  if (spendError) {
    console.error('failed to spend credits:', spendError);
    return Response.json({ error: 'Failed to reserve credits. Please try again.' }, { status: 500 });
  }
  if (balanceAfterSpend === null) {
    return Response.json(
      { error: '크레딧이 부족합니다. 크레딧을 구매한 뒤 다시 시도해주세요.' },
      { status: 402 }
    );
  }

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
    return Response.json({ tracks, credits: balanceAfterSpend });
  } catch (err) {
    console.error('music generation failed:', err);

    // Generation failed after we charged for it — give the credits back.
    const { error: refundError } = await supabase.rpc('refund_credits', { p_amount: cost });
    if (refundError) {
      console.error('failed to refund credits:', refundError);
    }

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
