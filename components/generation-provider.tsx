'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/components/auth-provider';
import type { GenerateOptions } from '@/components/workspace/prompt-input-box';
import type { Track } from '@/lib/music';

// A completed generation, tagged with a token so the workspace can tell a fresh
// result apart from one it has already consumed.
interface GenerationResult {
  tracks: Track[];
  token: number;
}

type GenerationContextValue = {
  /** True while a generation request is in flight. */
  isGenerating: boolean;
  /** Last generation error, or null. */
  error: string | null;
  /** Set when the API rejected the request for insufficient credits (402). */
  insufficientCredit: boolean;
  /** The most recent completed generation, or null once consumed. */
  result: GenerationResult | null;
  /** Kick off a generation. Resolves when the request settles. */
  generate: (prompt: string, options: GenerateOptions) => Promise<void>;
  /** Mark the current result as consumed (clears it). */
  clearResult: () => void;
  /** Acknowledge the insufficient-credit flag (clears it). */
  clearInsufficientCredit: () => void;
};

const GenerationContext = createContext<GenerationContextValue | undefined>(undefined);

/**
 * Owns the music-generation request. Lives at the root layout (above the route
 * tree) so the in-flight state survives client-side navigation: a user can fire
 * a generation, browse to another screen, and come back to still see it running.
 */
export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const { refreshCredits } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficientCredit, setInsufficientCredit] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const clearResult = useCallback(() => setResult(null), []);
  const clearInsufficientCredit = useCallback(() => setInsufficientCredit(false), []);

  const generate = useCallback(
    async (prompt: string, options: GenerateOptions) => {
      const trimmed = prompt.trim();
      // Ignore empty prompts or a second request while one is already running.
      if (!trimmed || isGenerating) return;

      setIsGenerating(true);
      setError(null);
      setInsufficientCredit(false);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmed,
            lyrics: options.lyrics,
            duration: options.duration,
            batch_size: options.batchSize,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Out of credits — let the workspace surface the Buy Credit modal.
          if (res.status === 402) setInsufficientCredit(true);
          throw new Error(data.error || 'Generation failed');
        }
        const newTracks = (data.tracks ?? []) as Track[];
        if (newTracks.length === 0) {
          throw new Error('No tracks were generated.');
        }
        setResult({ tracks: newTracks, token: Date.now() });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsGenerating(false);
        // Reflect the new balance (charged on success, refunded on failure).
        refreshCredits();
      }
    },
    [isGenerating, refreshCredits]
  );

  const value = useMemo<GenerationContextValue>(
    () => ({
      isGenerating,
      error,
      insufficientCredit,
      result,
      generate,
      clearResult,
      clearInsufficientCredit,
    }),
    [isGenerating, error, insufficientCredit, result, generate, clearResult, clearInsufficientCredit]
  );

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}

export function useGeneration() {
  const ctx = useContext(GenerationContext);
  if (!ctx) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return ctx;
}
