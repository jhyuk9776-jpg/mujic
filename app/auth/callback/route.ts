import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// OAuth redirect target. Supabase sends the user here with a `code` that we
// exchange for a session (PKCE flow). The session cookies are written via the
// server client's setAll handler.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Where to send the user after a successful login.
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — bounce back to the auth page with an error flag.
  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}
