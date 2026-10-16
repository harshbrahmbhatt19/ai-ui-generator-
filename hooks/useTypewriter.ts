import { useState, useEffect } from 'react';

/**
 * Simulates streaming when the code changes by a large amount (AI generation),
 * but returns the raw code immediately for small changes (manual typing).
 */
export function useTypewriter(code: string, speed = 10) {
  const [prevCode, setPrevCode] = useState(code);
  // null = not animating; number = how many characters are currently revealed
  const [progress, setProgress] = useState<number | null>(null);

  // Adjust state during render when the incoming code changes
  // (React-recommended alternative to calling setState inside an effect).
  if (code !== prevCode) {
    const diff = Math.abs(code.length - prevCode.length);
    setPrevCode(code);
    setProgress(code && diff > 10 ? 0 : null);
  }

  const isAnimating = progress !== null;

  useEffect(() => {
    if (!isAnimating) return;

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p === null) return p;
        const next = p + 3;
        return next >= code.length ? null : next;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isAnimating, code, speed]);

  // Not animating: return raw code directly (avoids cursor jumping while typing).
  return progress !== null ? code.slice(0, progress) : code;
}
