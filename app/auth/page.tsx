'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
        <path
            fill="#EA4335"
            d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
        />
        <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71l2.84 2.2c1.66-1.53 2.76-3.79 2.76-6.56z"
        />
        <path
            fill="#FBBC05"
            d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.01 9.01 0 0 0 0 9c0 1.45.35 2.83.96 4.04l2.92-2.26z"
        />
        <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.44 15.98 5.48 18 9 18z"
        />
    </svg>
);

export default function AuthPage() {
    const { signInWithGoogle } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const handleGoogleSignIn = async () => {
        setSubmitting(true);
        try {
            await signInWithGoogle();
            // On success the browser is redirected to Google, so we don't reset state.
        } catch {
            setSubmitting(false);
        }
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-[#171717] px-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.06] px-7 py-9 backdrop-blur-xl"
            >
                <div className="flex flex-col items-center text-center">
                    {/* Wordmark */}
                    <span className="text-3xl text-white" style={{ fontFamily: 'var(--font-school-bell)' }}>
                        mujic.
                    </span>

                    <h1 className="mt-8 text-lg font-semibold tracking-tight text-white">
                        Create your sound
                    </h1>
                    <p className="mt-1.5 max-w-[15rem] text-xs leading-relaxed text-white/45">
                        Moments connected thought music
                    </p>

                    {/* Google button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={submitting}
                        className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-white py-2.5 text-xs font-medium text-[#171717] transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <GoogleIcon />
                        <span>{submitting ? 'Connecting…' : 'Continue with Google'}</span>
                    </button>

                    <p className="mt-6 max-w-[15rem] text-[0.6875rem] leading-relaxed text-white/30">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-white/55 underline-offset-2 transition-colors hover:text-white/80 hover:underline">
                            Terms
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-white/55 underline-offset-2 transition-colors hover:text-white/80 hover:underline">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
