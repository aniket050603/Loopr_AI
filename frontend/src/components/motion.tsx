import { useEffect, useRef, useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';

/** Animates a number from 0 to `target` with an ease-out curve. Returns the formatted string. */
export function useCountUp(target: number, duration = 900, decimals = 0): string {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Fades/slides content in the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
} & Record<string, unknown>) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(16px)',
        transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

/**
 * Mouse-tracking spotlight for cards. Spread `spotlight` onto the card element
 * and `spotlightSx` into its sx; a soft radial glow follows the cursor.
 */
export function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const spotlight = { ref, onMouseMove };

  const spotlightSx = {
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      background:
        'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(34,197,94,0.10), transparent 65%)',
      opacity: 0,
      transition: 'opacity 0.25s ease',
      pointerEvents: 'none',
    },
    '&:hover::before': { opacity: 1 },
  };

  return { spotlight, spotlightSx };
}

/** "Synced Xs ago" ticker that re-renders every second. */
export function useElapsed(updatedAt: number | undefined): string {
  const [, force] = useState(0);
  useEffect(() => {
    if (!updatedAt) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [updatedAt]);

  if (!updatedAt) return 'connecting…';
  const seconds = Math.max(0, Math.round((Date.now() - updatedAt) / 1000));
  if (seconds < 3) return 'synced just now';
  if (seconds < 60) return `synced ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `synced ${minutes}m ago`;
}
