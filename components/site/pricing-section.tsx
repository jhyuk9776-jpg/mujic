'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

interface Plan {
  name: string;
  price: number;
  credits: number;
  tagline: string;
  featured?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Pro',
    price: 5,
    credits: 100,
    tagline: '가볍게 시작하는 크리에이터를 위한 플랜',
  },
  {
    name: 'Ultra',
    price: 50,
    credits: 1100,
    tagline: '쉴 새 없이 만들어 내는 당신을 위한 플랜',
    featured: true,
  },
];

interface PlanCardProps {
  plan: Plan;
  index: number;
}

function PlanCard({ plan, index }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease, delay: 0.15 * index }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border p-8 backdrop-blur-2xl transition-colors duration-500',
        plan.featured
          ? 'border-white/25 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_30px_70px_-25px_rgba(0,0,0,0.8)] hover:border-white/40'
          : 'border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_24px_60px_-25px_rgba(0,0,0,0.7)] hover:border-white/25'
      )}
    >
      {/* Soft top-edge sheen */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.08] blur-3xl" />

      {/* "Best value" badge for the featured plan */}
      {plan.featured && (
        <span className="absolute right-6 top-7 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-xl">
          Best value
        </span>
      )}

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Plan name */}
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
          {plan.name}
        </span>

        {/* Price */}
        <div className="mt-6 flex items-baseline gap-1.5">
          <span className="text-6xl font-bold tracking-tight text-white">
            ${plan.price}
          </span>
          <span className="text-sm text-white/40">/ 1회</span>
        </div>

        {/* Credits */}
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-white">
            {plan.credits.toLocaleString()}
          </span>
          <span className="text-sm text-white/50">credits</span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-white/55">
          {plan.tagline}
        </p>

        {/* CTA — label is the plan + its credits */}
        <Link
          href="/auth"
          className={cn(
            'mt-10 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.98]',
            plan.featured
              ? 'bg-white text-black hover:bg-white/90'
              : 'border border-white/20 bg-white/[0.04] text-white backdrop-blur-xl hover:border-white/40 hover:bg-white/10'
          )}
        >
          {plan.credits.toLocaleString()} credits
        </Link>
      </div>
    </motion.div>
  );
}

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-8 py-24 font-sans md:px-12"
    >
      {/* Soft monochrome halo for depth */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[140px]" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
        {/* Kicker */}
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-white/60"
        >
          Pricing
        </motion.span>

        {/* Latin display accent in the hero's Pirata One face */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
          className="text-6xl leading-none text-white md:text-8xl"
          style={{ fontFamily: 'var(--font-pirata-one)' }}
        >
          Pricing.
        </motion.h2>

        {/* The core message */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          className="mt-6 max-w-2xl text-2xl font-extrabold leading-snug tracking-tight text-white md:text-3xl"
        >
          당신의 흐름에 맞는 <span className="whitespace-nowrap text-white/70">플랜</span>을 선택하세요
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="mt-4 max-w-md text-sm leading-relaxed text-white/55"
        >
          복잡한 약정 없이, 필요한 만큼 크레딧을 충전하세요. 만든 음악은 모두 당신의 것입니다.
        </motion.p>
      </div>

      {/* Two plan cards, centered */}
      <div className="relative z-10 mt-14 grid w-full max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
        {plans.map((plan, i) => (
          <PlanCard key={plan.name} plan={plan} index={i} />
        ))}
      </div>
    </section>
  );
}
