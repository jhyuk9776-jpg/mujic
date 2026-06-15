'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

interface Feature {
  image: string;
  alt: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    image: '/image/1.jpg',
    alt: '별이 쏟아지는 밤하늘 아래 피아노 앞에 선 소녀',
    icon: Sparkles,
    title: '내 취향 그대로',
    description: '원하는 분위기를 한 줄로 입력하세요. AI가 당신만을 위한 음악을 처음부터 새로 만들어 냅니다.',
  },
  {
    image: '/image/2.jpg',
    alt: '헤드폰을 쓰고 음악에 잠긴 여인',
    icon: ShieldCheck,
    title: '저작권 걱정 끝',
    description: '저작권에 더 이상 얽매이지 마세요. 생성된 모든 트랙은 100% 로열티 프리, 어디든 자유롭게 쓸 수 있습니다.',
  },
  {
    image: '/image/3.jpg',
    alt: '다채로운 색채에 둘러싸여 헤드폰을 쓴 인물',
    icon: Zap,
    title: '다운로드는 이제 그만',
    description: 'mp3 파일을 찾아 헤매는 시간은 끝. 단 몇 초 만에 완성된 새 음악을 바로 손에 넣으세요.',
  },
];

export function FeaturesSection() {
  // Tall scroll track: each image gets ~one viewport of scrolling. A sticky inner
  // pane stays pinned while the active image advances one at a time as you scroll.
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(features.length - 1, Math.max(0, Math.floor(v * features.length)));
    setActive(next);
  });

  // Smooth-scroll to a given image's slot when a dot is clicked.
  const scrollTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const range = el.offsetHeight - window.innerHeight;
    const top = el.offsetTop + (i / features.length) * range + 1;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const feature = features[active];
  const Icon = feature.icon;

  return (
    <section
      ref={ref}
      id="features"
      className="relative w-full bg-background font-sans"
      style={{ height: `${features.length * 100}vh` }}
    >
      {/* Pinned viewport — only its contents change as you scroll through the track */}
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Full-bleed image — crossfades to the next as the active index advances */}
        <AnimatePresence mode="sync">
          <motion.img
            key={feature.image}
            src={feature.image}
            alt={feature.alt}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Cinematic legibility wash over the imagery */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />

        {/* Kicker — top-left */}
        <span className="absolute left-8 top-10 z-10 text-sm font-semibold uppercase tracking-[0.4em] text-white/70 md:left-12">
          Features
        </span>

        {/* Glass caption pinned to the bottom — its copy swaps with each image */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-12 md:px-12 md:pb-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease }}
                className="max-w-xl rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_24px_60px_-20px_rgba(0,0,0,0.7)] md:p-8"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl">
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
                  {feature.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots — reflect the active image and let you jump to one */}
            <div className="flex items-center gap-3">
              {features.map((f, i) => (
                <button
                  key={f.image}
                  onClick={() => scrollTo(i)}
                  aria-label={`${i + 1}번째 이미지 보기`}
                  className="h-2.5 rounded-full border border-white/30 transition-all duration-500"
                  style={{
                    width: i === active ? 44 : 10,
                    backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Subtle scroll hint, shown only on the first image */}
        <motion.span
          animate={{ opacity: active === 0 ? 1 : 0, y: [0, 6, 0] }}
          transition={{ opacity: { duration: 0.4 }, y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[11px] font-medium uppercase tracking-[0.3em] text-white/50"
        >
          Scroll
        </motion.span>
      </div>
    </section>
  );
}
