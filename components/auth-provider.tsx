'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  /** True until the initial session has been resolved. */
  loading: boolean;
  /** Remaining generation credits, or null before they've loaded. */
  credits: number | null;
  /** Re-read the credit balance from the database (e.g. after a generation). */
  refreshCredits: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // One browser client instance for the whole app.
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);

  // Read the signed-in user's credit balance from their profile row.
  const refreshCredits = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCredits(null);
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();
    setCredits((data?.credits as number | undefined) ?? null);
  }, [supabase]);

  useEffect(() => {
    // Resolve the current session on mount.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Keep state in sync with sign-in / sign-out / token refresh events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load (or clear) the credit balance whenever the signed-in user changes.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      // Clearing on sign-out happens in a callback, not the effect body.
      Promise.resolve().then(() => setCredits(null));
      return;
    }
    let active = true;
    supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (active) setCredits((data?.credits as number | undefined) ?? null);
      });
    return () => {
      active = false;
    };
  }, [userId, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      credits,
      refreshCredits,
      signInWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, credits, refreshCredits, supabase]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
