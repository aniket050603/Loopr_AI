/**
 * LoginIntro — a staged particle animation that plays before the login form.
 *
 * Recreates the reference video: glowing particles on a dark canvas
 * morph through four phases, each paired with a text reveal.
 *
 *   1. FLOW   — thousands of particles stream along a curl-noise flow field
 *               (silk-thread trails, like the laptop video's opening).
 *   2. BURST  — particles explode outward into a nebula cloud; big headline.
 *   3. ORBS   — the cloud condenses into scattered glowing orbs; sub-line.
 *   4. VORTEX — everything swirls into a vortex and collapses to center.
 *
 * Finishing (or skipping) fades the canvas out and reveals the login card.
 * Rendering is plain canvas 2D — no dependencies, ~60fps, mobile-friendly.
 */

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FONT_DISPLAY, FONT_MONO, type LedgerMode } from '../theme/theme';

/** Total intro duration in ms (skip button appears after 1s). */
const INTRO_DURATION_MS = 9000;

/** Phase boundaries as fractions of the total duration. */
const PHASE_FLOW_END = 0.34;
const PHASE_BURST_END = 0.58;
const PHASE_ORBS_END = 0.82;
// remaining time is the VORTEX phase

/** Every color the intro uses, per theme. RGB triplets compose with alpha. */
interface IntroTheme {
  canvas: string;
  /** Motion-blur fade that draws the silk trails. */
  trailFade: string;
  /** Edge darkening so the text always reads. */
  vignette: string;
  blue: string;
  amber: string;
  titleInk: string;
  kickerInk: string;
  subInk: string;
  microInk: string;
  skipInk: string;
}

const INTRO_THEMES: Record<LedgerMode, IntroTheme> = {
  dark: {
    canvas: '#04060c',
    trailFade: 'rgba(4, 6, 12, 0.09)',
    vignette: 'rgba(4, 6, 12, 0.55)',
    blue: '96, 148, 255',
    amber: '234, 179, 8',
    titleInk: '#f4f6fb',
    kickerInk: 'rgba(255, 255, 255, 0.5)',
    subInk: 'rgba(255, 255, 255, 0.62)',
    microInk: 'rgba(255, 255, 255, 0.34)',
    skipInk: 'rgba(255, 255, 255, 0.4)',
  },
  light: {
    canvas: '#f6f4ef',
    trailFade: 'rgba(246, 244, 239, 0.1)',
    vignette: 'rgba(195, 201, 212, 0.45)',
    blue: '37, 99, 235',
    amber: '217, 119, 6',
    titleInk: '#14181f',
    kickerInk: 'rgba(20, 24, 31, 0.55)',
    subInk: 'rgba(20, 24, 31, 0.65)',
    microInk: 'rgba(20, 24, 31, 0.4)',
    skipInk: 'rgba(20, 24, 31, 0.45)',
  },
};

/** Particle count scales with screen size so phones stay at 60fps. */
function particleCount(width: number): number {
  if (width < 600) return 900;
  if (width < 1200) return 1600;
  return 2400;
}

/** Cheap deterministic pseudo-random (so the intro looks the same every run). */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface IntroParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0..1 random personality: speed multiplier, color mixing, phase bias. */
  rand: number;
  size: number;
}

interface PhaseText {
  kicker?: string;
  title: string;
  sub?: string;
}

/** Text revealed during each phase, in Loopr's voice. */
const PHASE_TEXTS: Record<'flow' | 'burst' | 'orbs' | 'vortex', PhaseText> = {
  flow: { title: 'Every cent,\nin motion.' },
  burst: { title: 'EVERY CENT\nON THE RECORD.' },
  orbs: { title: 'One ledger.\nEvery transaction.' },
  vortex: {
    kicker: 'JWT · MONGODB · REACT',
    title: 'Begin today.',
    sub: 'The ledger is waiting.',
  },
};

export function LoginIntro({ onFinish, mode }: { onFinish: () => void; mode: LedgerMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finishedRef = useRef(false);
  const finish = useRef(onFinish);
  finish.current = onFinish;
  // Read once by the animation effect; the theme cannot change mid-intro.
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const T = INTRO_THEMES[modeRef.current];

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    /** Cached radial vignette; rebuilt on resize so the text always reads. */
    let vignette: CanvasGradient | null = null;

    function resize(): void {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      vignette = null;
    }
    resize();
    window.addEventListener('resize', resize);

    // --- Particles ---------------------------------------------------------

    const COUNT = particleCount(width);
    const particles: IntroParticle[] = [];
    function spawn(): void {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: pseudoRandom(i) * width,
          y: pseudoRandom(i + 0.5) * height,
          vx: 0,
          vy: 0,
          rand: pseudoRandom(i + 0.25),
          size: 0.6 + pseudoRandom(i + 0.75) * 1.4,
        });
      }
    }
    spawn();

    // --- Flow field (curl-ish noise from layered sines) --------------------

    function flowAngle(x: number, y: number, t: number): number {
      return (
        Math.sin(x * 0.0016 + t * 0.24) * 1.7 +
        Math.cos(y * 0.0021 - t * 0.19) * 1.7 +
        Math.sin((x + y) * 0.0009 + t * 0.11) * 1.2
      );
    }

    // --- Orb targets for the ORBS phase ------------------------------------

    interface Orb {
      x: number;
      y: number;
      /** Glow radius — particles cluster inside it. */
      r: number;
    }
    let orbs: Orb[] = [];
    function layoutOrbs(): void {
      orbs = [];
      const count = 9;
      const cx = width / 2;
      const cy = height / 2;
      const rx = Math.min(width, 560) * 0.34;
      const ry = Math.min(height, 520) * 0.3;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + 0.35;
        orbs.push({
          x: cx + Math.cos(angle) * rx * (0.75 + pseudoRandom(i * 3.3) * 0.5),
          y: cy + Math.sin(angle) * ry * (0.75 + pseudoRandom(i * 5.7) * 0.5),
          r: 16 + pseudoRandom(i * 7.9) * 26,
        });
      }
    }
    layoutOrbs();

    // --- Animation loop ----------------------------------------------------

    const start = performance.now();
    let raf = 0;
    let currentPhase = '';

    function phaseOf(progress: number): 'flow' | 'burst' | 'orbs' | 'vortex' {
      if (progress < PHASE_FLOW_END) return 'flow';
      if (progress < PHASE_BURST_END) return 'burst';
      if (progress < PHASE_ORBS_END) return 'orbs';
      return 'vortex';
    }

    function step(now: number): void {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / INTRO_DURATION_MS);
      const phase = phaseOf(progress);
      const t = elapsed / 1000;

      // Motion-blur style fade instead of a hard clear → long silk trails.
      ctx!.fillStyle = T.trailFade;
      ctx!.fillRect(0, 0, width, height);

      // Text is drawn as DOM (crisper) — but each phase change swaps it.
      if (currentPhase !== phase) {
        currentPhase = phase;
        setText(phase);
      }

      const cx = width / 2;
      const cy = height / 2;

      for (const p of particles) {
        if (phase === 'flow') {
          const a = flowAngle(p.x, p.y, t);
          const speed = 1.1 + p.rand * 2.1;
          p.vx += Math.cos(a) * speed * 0.14;
          p.vy += Math.sin(a) * speed * 0.14;
        } else if (phase === 'burst') {
          // Explode outward from center, decaying with distance.
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const push = (1 - Math.min(1, dist / (Math.max(width, height) * 0.55))) * 2.6;
          p.vx += (dx / dist) * push * (0.7 + p.rand);
          p.vy += (dy / dist) * push * (0.7 + p.rand);
        } else if (phase === 'orbs') {
          // Each particle is captured by its nearest orb and orbits it.
          const orb = orbs[Math.floor(p.rand * orbs.length)] ?? orbs[0];
          const dx = orb.x - p.x;
          const dy = orb.y - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = 0.32 + p.rand * 0.3;
          p.vx += (dx / dist) * pull + (-dy / dist) * pull * 0.9; // pull + tangential swirl
          p.vy += (dy / dist) * pull + (dx / dist) * pull * 0.9;
        } else {
          // Vortex: spiral inward, tightening over time.
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          const tighten = 0.14 + progress * 0.5;
          p.vx += (dx / dist) * tighten + (-dy / dist) * tighten * 1.35;
          p.vy += (dy / dist) * tighten + (dx / dist) * tighten * 1.35;
        }

        // Damping keeps every phase stable regardless of framerate.
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap-around so particles never starve the field.
        const margin = 40;
        if (p.x < -margin) p.x = width + margin;
        if (p.x > width + margin) p.x = -margin;
        if (p.y < -margin) p.y = height + margin;
        if (p.y > height + margin) p.y = -margin;

        drawParticle(p, phase, progress);
      }

      // Orb glows give the ORBS phase its "constellation" look.
      if (phase === 'orbs') {
        for (const orb of orbs) {
          const glow = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * 2.2);
          glow.addColorStop(0, `rgba(${T.blue}, 0.2)`);
          glow.addColorStop(1, `rgba(${T.blue}, 0)`);
          ctx!.fillStyle = glow;
          ctx!.fillRect(orb.x - orb.r * 2.2, orb.y - orb.r * 2.2, orb.r * 4.4, orb.r * 4.4);
        }
      }

      // Gentle vignette (cached per resize) so the text always reads.
      if (!vignette) {
        vignette = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.7);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, T.vignette);
      }
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, width, height);

      if (progress >= 1) {
        finishIntro();
        return;
      }
      raf = requestAnimationFrame(step);
    }

    function drawParticle(p: IntroParticle, phase: string, progress: number): void {
      // Blue core with an amber minority — echoes Loopr's brand pairing.
      const amber = p.rand > 0.86;
      const alpha =
        phase === 'vortex' ? 0.55 + progress * 0.4 : 0.35 + p.rand * 0.5;
      ctx!.fillStyle = amber
        ? `rgba(${T.amber}, ${alpha})`
        : `rgba(${T.blue}, ${alpha})`;
      const size = phase === 'orbs' ? p.size * 1.25 : p.size;
      ctx!.fillRect(p.x, p.y, size, size);
    }

    function finishIntro(): void {
      if (finishedRef.current) return;
      finishedRef.current = true;
      finish.current();
    }

    raf = requestAnimationFrame(step);

    const skipKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finishIntro();
    };
    window.addEventListener('keydown', skipKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', skipKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Phase text (DOM overlay for crisp type) -----------------------------

  const textRootRef = useRef<HTMLDivElement>(null);

  function setText(phase: 'flow' | 'burst' | 'orbs' | 'vortex'): void {
    const root = textRootRef.current;
    if (!root) return;
    const theme = INTRO_THEMES[modeRef.current];
    const text = PHASE_TEXTS[phase];
    root.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'intro-text intro-text-enter';
    if (text.kicker) {
      const kicker = document.createElement('div');
      kicker.className = 'intro-kicker';
      kicker.textContent = text.kicker;
      wrap.appendChild(kicker);
    }
    const title = document.createElement('div');
    title.className = 'intro-title';
    for (const line of text.title.split('\n')) {
      const lineEl = document.createElement('div');
      lineEl.textContent = line;
      title.appendChild(lineEl);
    }
    wrap.appendChild(title);
    if (text.sub) {
      const sub = document.createElement('div');
      sub.className = 'intro-sub';
      sub.textContent = text.sub;
      wrap.appendChild(sub);
    }
    root.appendChild(wrap);
    // Re-ink per theme via CSS custom properties (see the style block).
    root.style.setProperty('--intro-title-ink', theme.titleInk);
    root.style.setProperty('--intro-blue', theme.blue);
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: INTRO_THEMES[mode].canvas,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => finish.current()}
      aria-label="Intro animation — click anywhere to skip"
      data-testid="login-intro"
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />

      {/* Phase text overlay */}
      <div
        ref={textRootRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* populated by setText() at phase changes */}
      </div>

      {/* Terminal-style frame micro-labels, echoing the reference video */}
      <Typography
        aria-hidden
        sx={{
          position: 'absolute',
          top: 18,
          left: 20,
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: '0.22em',
          color: INTRO_THEMES[mode].microInk,
          userSelect: 'none',
        }}
      >
        ( LOOPR )
      </Typography>
      <Typography
        aria-hidden
        sx={{
          position: 'absolute',
          top: 18,
          right: 20,
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: '0.22em',
          color: 'rgba(255,255,255,0.34)',
          userSelect: 'none',
        }}
      >
        FY 2024
      </Typography>

      {/* Skip affordance */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontSize: 10.5,
          letterSpacing: '0.24em',
          color: INTRO_THEMES[mode].skipInk,
          userSelect: 'none',
          animation: 'introFade 1.2s ease 0.9s both',
          '@keyframes introFade': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      >
        CLICK ANYWHERE TO SKIP
      </Typography>

      {/* Phase-text styles (scoped by class names below) */}
      <style>{`
        .intro-text { text-align: center; padding: 0 24px; }
        .intro-text-enter { animation: introRise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .intro-kicker {
          font-family: ${FONT_MONO};
          font-size: 11px; letter-spacing: 0.3em;
          color: ${INTRO_THEMES[mode].kickerInk}; margin-bottom: 14px;
        }
        .intro-title {
          font-family: ${FONT_DISPLAY};
          font-weight: 700; line-height: 1.05; letter-spacing: -0.02em;
          color: var(--intro-title-ink, #f4f6fb);
          text-shadow: 0 0 40px rgba(var(--intro-blue, 96, 148, 255), 0.35);
          font-size: clamp(30px, 6vw, 64px);
        }
        .intro-sub {
          font-family: ${FONT_MONO};
          font-size: 13px; letter-spacing: 0.08em;
          color: ${INTRO_THEMES[mode].subInk}; margin-top: 16px;
        }
        @keyframes introRise {
          from { opacity: 0; transform: translateY(18px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
      `}</style>
    </Box>
  );
}
