import { MinimalistHero } from '@/components/ui/minimalist-hero';

const navLinks = [
  { label: 'FEATURES', href: '#' },
  { label: 'PRICING', href: '#' },
  { label: 'CONTACT', href: '#' },
];

export default function Home() {
  return (
    <MinimalistHero
      logoText="mujic."
      navLinks={navLinks}
      mainText="Generate original, royalty-free music for your YouTube videos in seconds. AI-powered tracks crafted to match your content."
      readMoreLink="#"
      imageSrc="https://ik.imagekit.io/fpxbgsota/image%2013.png?updatedAt=1753531863793"
      imageAlt="A portrait of a person in a black turtleneck, in profile."
      overlayText={{
        part1: 'Create',
        part2: 'Your Sound.',
      }}
    />
  );
}
