'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeLink } from '@/components/site/home-link';
import { cn } from '@/lib/utils';

/** One block of legal copy — an optional heading, body paragraphs, and bullets. */
export interface LegalSection {
    heading: string;
    body?: string[];
    bullets?: string[];
}

export interface LegalPageProps {
    /** Small tracked label above the title, e.g. "LEGAL". */
    kicker: string;
    /** Display title rendered in the Pirata One face. */
    title: string;
    /** Lead paragraph under the title. */
    intro: string;
    /** Human-readable revision date, e.g. "June 12, 2026". */
    lastUpdated: string;
    sections: LegalSection[];
    /** Which sibling legal page to point at in the header/footer. */
    sibling: { label: string; href: string };
}

const ease = [0.16, 1, 0.3, 1] as const;

export function LegalPage({ kicker, title, intro, lastUpdated, sections, sibling }: LegalPageProps) {
    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#181818] font-sans text-white">
            {/* Atmosphere — a faint gold glow up top so the page reads as crafted, not flat. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
                style={{
                    background:
                        'radial-gradient(60% 100% at 50% 0%, rgba(201,169,97,0.10) 0%, rgba(201,169,97,0.03) 35%, transparent 70%)',
                }}
            />

            {/* Header — wordmark home link + sibling legal page */}
            <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
                <HomeLink
                    className="text-2xl text-white transition-opacity hover:opacity-80"
                    style={{ fontFamily: 'var(--font-school-bell)' }}
                >
                    mujic.
                </HomeLink>
                <Link
                    href={sibling.href}
                    className="text-[0.6875rem] font-semibold uppercase tracking-widest text-white/45 transition-colors hover:text-white/80"
                >
                    {sibling.label}
                </Link>
            </header>

            {/* Document body */}
            <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-28 pt-10 md:pt-16">
                {/* Title block */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease }}
                >
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-[#C9A961]">
                        {kicker}
                    </p>
                    <h1 className="mt-4 text-5xl font-bold tracking-tight text-white md:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/55">{intro}</p>
                    <p className="mt-4 text-xs text-white/30">Last updated: {lastUpdated}</p>
                </motion.div>

                <div className="mt-12 h-px w-full bg-white/10" />

                {/* Sections — staggered reveal */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
                    }}
                    className="mt-12 flex flex-col gap-11"
                >
                    {sections.map((section, i) => (
                        <motion.section
                            key={section.heading}
                            variants={{
                                hidden: { opacity: 0, y: 14 },
                                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
                            }}
                        >
                            <h2 className="flex items-baseline gap-3 text-base font-semibold tracking-tight text-white">
                                <span className="tabular-nums text-xs font-medium text-[#C9A961]/70">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                {section.heading}
                            </h2>

                            {section.body?.map((paragraph, p) => (
                                <p
                                    key={p}
                                    className={cn('text-sm leading-relaxed text-white/55', p === 0 ? 'mt-3' : 'mt-3')}
                                >
                                    {paragraph}
                                </p>
                            ))}

                            {section.bullets && (
                                <ul className="mt-3 flex flex-col gap-2">
                                    {section.bullets.map((item, b) => (
                                        <li key={b} className="flex gap-3 text-sm leading-relaxed text-white/55">
                                            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#C9A961]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.section>
                    ))}
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                    <HomeLink
                        className="text-xl text-white/80 transition-opacity hover:opacity-100"
                        style={{ fontFamily: 'var(--font-school-bell)' }}
                    >
                        mujic.
                    </HomeLink>
                    <div className="flex items-center gap-6 text-[0.6875rem] font-semibold uppercase tracking-widest text-white/40">
                        <Link href="/privacy" className="transition-colors hover:text-white/80">
                            Privacy
                        </Link>
                        <Link href="/terms" className="transition-colors hover:text-white/80">
                            Terms
                        </Link>
                        <span className="text-white/25">© {new Date().getFullYear()} mujic</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
