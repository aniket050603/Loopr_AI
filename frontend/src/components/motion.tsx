import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';

/** Animates a number from 0 to `target` with an ease-out curve. */
export function useCountUp(target: number, duration = 900, decimals = 0): string {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
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

/** Returns a style object that staggers children fade/slide-in. */
export const staggerParent = {
  '& > *': {
    animation: 'staggerIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  '@keyframes staggerIn': {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'none' },
  },
} as const;

export function staggerDelay(index: number, step = 0.06): { animationDelay: string } {
  return { animationDelay: `${(index * step).toFixed(2)}s` };
}

/** Animated progress ring (SVG). */
export function ProgressRing({
  value,
  max,
  size = 54,
  stroke = 5,
  color,
  trackColor,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [dash, setDash] = useState(c);

  useEffect(() => {
    const timer = setTimeout(() => setDash(c * (1 - pct)), 80);
    return () => clearTimeout(timer);
  }, [c, pct]);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={0}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      {children ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {children}
        </Box>
      ) : null}
    </Box>
  );
}
