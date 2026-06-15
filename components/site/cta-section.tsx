'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

// Silk is a WebGL canvas — load it on the client only to avoid SSR issues.
const Silk = dynamic(() => import('@/components/ui/silk'), { ssr: false });

export function CTASection() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-8 font-sans md:px-12">
      {/* Full-bleed animated silk backdrop, in a neutral graphite tone */}
      <div className="pointer-events-none absolute inset-0">
        <Silk color="#262626" speed={4} scale={1.2} noiseIntensity={1.4} rotation={0.1} />
      </div>

      {/* Strong legibility wash + vignette so the copy reads crisply over the motion */}
      <div className="pointer-events-none absolute inset-0 bg-black/65" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Kicker */}
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-white/70"
        >
          Get Started
        </motion.span>

        {/* Latin display accent in the hero's Pirata One face */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
          className="text-6xl leading-none text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] md:text-8xl"
          style={{ fontFamily: 'var(--font-pirata-one)' }}
        >
          Start Now.
        </motion.h2>

        {/* The core message */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          className="mt-6 max-w-xl text-2xl font-extrabold leading-snug tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-3xl"
        >
          지금 바로, 당신의 <span className="whitespace-nowrap underline decoration-white/40 decoration-2 underline-offset-8">첫 곡</span>을 만들어 보세요.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="mt-4 max-w-md text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
        >
          가입은 단 몇 초. 카드 없이 시작하고, 만든 음악은 모두 당신의 것입니다.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.35 }}
          className="mt-10"
        >
          <Link
            href="/auth"
            className="group flex h-13 items-center justify-center gap-2 rounded-full bg-white px-9 py-3.5 text-sm font-bold text-black shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:bg-white/90 active:scale-[0.98]"
          >
            무료로 시작하기
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
