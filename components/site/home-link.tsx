'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

interface HomeLinkProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

/**
 * Brand logo link. Always points at the landing page (`/`), but if the user is
 * already there a plain `<Link>` would be a no-op — so we reload instead, matching
 * the "click the logo to refresh the home page" behavior.
 */
export function HomeLink({
  children,
  className,
  style,
  'aria-label': ariaLabel = '홈으로 이동',
}: HomeLinkProps) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Only intercept plain left-clicks so modifier/middle-clicks keep their
    // native "open in new tab" behavior.
    if (pathname === '/' && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <Link href="/" aria-label={ariaLabel} className={className} style={style} onClick={handleClick}>
      {children}
    </Link>
  );
}
