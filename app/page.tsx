import type { CSSProperties } from 'react';
import { MinimalistHero } from '@/components/ui/minimalist-hero';
import { ExampleSection } from '@/components/site/example-section';
import { FeaturesSection } from '@/components/site/features-section';
import { PricingSection } from '@/components/site/pricing-section';
import { CTASection } from '@/components/site/cta-section';
import { FooterSection } from '@/components/site/footer-section';

const navLinks = [
  { label: 'FEATURES', href: '#features' },
  { label: 'PRICING', href: '#pricing' },
  { label: 'CONTACT', href: '#' },
];

export default function Home() {
  return (
    <main
      // Pin the landing to a black-and-white, dark "liquid glass" palette regardless
      // of the visitor's system color scheme. These overrides cascade into every
      // `bg-background` / `text-foreground` / `*-foreground/x` utility used by the
      // sections below, while leaving the rest of the app (the workspace) untouched.
      style={
        {
          '--background': '#060606',
          '--foreground': '#ffffff',
          background: '#060606',
        } as CSSProperties
      }
    >
      <MinimalistHero
        logoText="mujic."
        navLinks={navLinks}
        mainText="유튜브 영상에 어울리는 저작권 걱정 없는 음악을 단 몇 초 만에 만들어 보세요. AI가 당신의 콘텐츠에 꼭 맞는 음악을 새로 만들어 드립니다."
        readMoreLink="/auth"
        imageSrc="https://ik.imagekit.io/fpxbgsota/image%2013.png?updatedAt=1753531863793"
        imageAlt="A portrait of a person in a black turtleneck, in profile."
        overlayText={{
          part1: '당신만의',
          part2: '선율을',
        }}
      />
      <ExampleSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
