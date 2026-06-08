'use client';

import type { CSSProperties } from 'react';

interface LoadingLinesProps {
  text?: string;
  /** Multiplier on every animation duration. >1 = slower. */
  speed?: number;
  /** Letter color (CSS color). Defaults to white. */
  color?: string;
}

// Sweeping text animation. Styles live in app/globals.css (.loading-lines*).
// Used for the "generating" state and the empty-state hint.
export function LoadingLines({ text = 'Loading', speed = 1, color }: LoadingLinesProps) {
  const style = {
    '--ll-letter-duration': `${4 * speed}s`,
    '--ll-transform-duration': `${2 * speed}s`,
    '--ll-opacity-duration': `${4 * speed}s`,
    ...(color ? { '--ll-color': color } : {}),
  } as CSSProperties;

  return (
    <div className="loading-lines" style={style}>
      {text.split('').map((letter, idx) => (
        <span
          key={idx}
          className="loading-lines__letter"
          style={{ animationDelay: `${(0.1 + idx * 0.105) * speed}s` }}
        >
          {letter === ' ' ? ' ' : letter}
        </span>
      ))}
      <div className="loading-lines__mask">
        <div className="loading-lines__gradient" />
      </div>
    </div>
  );
}

export default LoadingLines;
