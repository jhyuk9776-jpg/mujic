'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeLink } from '@/components/site/home-link';
import { cn } from '@/lib/utils';

interface MinimalistHeroProps {
  logoText: string;
  navLinks: { label: string; href: string }[];
  mainText: string;
  readMoreLink: string;
  imageSrc: string;
  imageAlt: string;
  overlayText: {
    part1: string;
    part2: string;
  };
  socialLinks?: { icon: React.ReactNode; href: string }[];
  locationText?: string;
  className?: string;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="text-xs font-semibold tracking-widest text-foreground/60 transition-colors hover:text-foreground"
  >
    {children}
  </a>
);

const SocialIcon = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground/60 transition-colors hover:text-foreground">
    {icon}
  </a>
);

export const MinimalistHero = ({
  logoText,
  navLinks,
  mainText,
  readMoreLink,
  imageSrc,
  imageAlt,
  overlayText,
  socialLinks,
  locationText,
  className,
}: MinimalistHeroProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        'relative flex min-h-[100svh] w-full flex-col items-center justify-between overflow-hidden bg-background p-6 font-sans sm:p-8 md:p-12',
        className
      )}
    >
      {/* Header */}
      <header className="z-30 flex w-full max-w-7xl items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold tracking-wider"
        >
          <HomeLink
            className="text-foreground/90 transition-opacity hover:opacity-80"
            style={{ fontFamily: 'var(--font-school-bell)' }}
          >
            {logoText}
          </HomeLink>
        </motion.div>
        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          <a
            href="/auth"
            className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold tracking-widest text-background transition-opacity hover:opacity-80"
          >
            시작하기
          </a>
        </div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setMenuOpen((v) => !v)}
          className="relative z-50 flex h-6 w-6 flex-col items-center justify-center md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span
            className={cn(
              'block h-0.5 w-6 bg-foreground transition-transform duration-300',
              menuOpen && 'translate-y-[3px] rotate-45'
            )}
          />
          <span
            className={cn(
              'mt-1.5 block h-0.5 w-6 bg-foreground transition-transform duration-300',
              menuOpen && '-translate-y-[5px] -rotate-45'
            )}
          />
        </motion.button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-md md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-semibold tracking-widest text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/auth"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold tracking-widest text-background transition-opacity hover:opacity-80"
            >
              시작하기
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative grid w-full max-w-7xl flex-grow grid-cols-1 items-center gap-6 py-6 sm:gap-8 md:grid-cols-3 md:gap-0 md:py-0">
        {/* Left Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="z-20 order-3 md:order-1 text-center md:text-left"
        >
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-foreground/80 md:mx-0">{mainText}</p>
          <a
            href={readMoreLink}
            className="mt-4 inline-block rounded-full bg-foreground px-5 py-2 text-xs font-semibold tracking-widest text-background transition-opacity hover:opacity-80"
          >
            시작하기
          </a>
        </motion.div>

        {/* Center Image with Circle */}
        <div className="relative order-2 md:order-2 flex justify-center items-center h-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="absolute z-0 h-[230px] w-[230px] rounded-full border border-white/15 bg-white/[0.06] shadow-[inset_0_2px_1px_rgba(255,255,255,0.35),inset_0_-30px_60px_-30px_rgba(255,255,255,0.15),0_40px_90px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]"
          />
          <motion.img
            src={imageSrc}
            alt={imageAlt}
            className="relative z-10 h-auto w-44 scale-150 object-cover sm:w-56 md:w-64 lg:w-72"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://placehold.co/400x600/111111/ffffff?text=Image+Not+Found`;
            }}
          />
        </div>

        {/* Right Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="z-20 order-1 md:order-3 flex items-center justify-center text-center md:justify-end md:pl-8 md:text-right lg:pl-12"
        >
          <h1
            className="text-4xl text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: 'var(--font-black-han-sans)' }}
          >
            {overlayText.part1}
            <br />
            {overlayText.part2}
          </h1>
        </motion.div>
      </div>

      {/* Footer Elements */}
      {(socialLinks?.length || locationText) && (
        <footer className="z-30 flex w-full max-w-7xl items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex items-center space-x-4"
          >
            {socialLinks?.map((link, index) => (
              <SocialIcon key={index} href={link.href} icon={link.icon} />
            ))}
          </motion.div>
          {locationText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="text-sm font-medium text-foreground/80"
            >
              {locationText}
            </motion.div>
          )}
        </footer>
      )}
    </div>
  );
};
