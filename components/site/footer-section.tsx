'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HomeLink } from '@/components/site/home-link';

const ease = [0.22, 1, 0.36, 1] as const;

interface SocialLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Brand glyphs — kept inline as SVG since lucide doesn't carry current X / Threads marks.
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.628-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 2.832.13c-.123-.736-.373-1.32-.745-1.74-.513-.578-1.308-.873-2.365-.88h-.029c-.85 0-2.001.234-2.736 1.327l-1.68-1.13c.985-1.465 2.585-2.27 4.416-2.27h.043c3.063.02 4.889 1.895 5.07 5.166.103.043.205.087.305.132 1.439.677 2.493 1.702 3.05 2.965.775 1.762.847 4.633-1.485 6.96-1.783 1.781-3.94 2.589-6.999 2.611Zm1.752-9.74c-.298 0-.598.01-.903.027-1.838.103-2.981.948-2.916 2.15.067 1.262 1.46 1.85 2.8 1.776 1.234-.067 2.844-.55 3.113-3.762a10.397 10.397 0 0 0-2.094-.191Z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}

const socials: SocialLink[] = [
  { label: 'X', href: 'https://x.com', icon: XIcon },
  { label: 'Threads', href: 'https://threads.net', icon: ThreadsIcon },
  { label: 'YouTube', href: 'https://youtube.com', icon: YoutubeIcon },
];

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export function FooterSection() {
  return (
    <footer className="relative w-full overflow-hidden bg-background px-8 pt-24 font-sans md:px-12">
      {/* Soft monochrome halo for depth */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[140px]" />

      {/* Top row — socials on the left, nav links on the right */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-start justify-between gap-8">
        {/* Left column — social marks stacked vertically, copyright beneath */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col gap-5"
        >
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 text-foreground/60 transition-colors duration-300 hover:border-foreground/30 hover:text-foreground"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}

          <span className="mt-3 text-sm font-medium text-foreground/40">@2026</span>
        </motion.div>

        {/* Right column — text links stacked vertically */}
        <motion.nav
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="flex flex-col items-end gap-4 text-right"
        >
          {links.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="group relative text-base font-medium text-foreground/60 transition-colors duration-300 hover:text-foreground"
            >
              {label}
              <span className="absolute -bottom-0.5 right-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </motion.nav>
      </div>

      {/* Oversize display wordmark — clipped flush to the bottom edge */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease, delay: 0.15 }}
        className="relative z-10 mx-auto mt-16 w-full max-w-[1600px]"
      >
        <HomeLink
          aria-label="홈으로 이동"
          className="block select-none text-center leading-[0.78] tracking-tight text-white/70 transition-opacity hover:opacity-90"
          style={{
            fontFamily: 'var(--font-pirata-one)',
            fontSize: 'clamp(4rem, 17vw, 13rem)',
          }}
        >
          mujic
          <span className="text-white/90">.</span>
        </HomeLink>
      </motion.div>
    </footer>
  );
}
