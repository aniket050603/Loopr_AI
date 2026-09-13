import { Box, Typography } from '@mui/material';
import { FONT_DISPLAY } from '../theme/theme';

/**
 * Loopr orbit mark: an open ring (the "loop") with a small dot riding it.
 * Pure SVG so it scales crisply at both sidebar and drawer sizes.
 */
export function LooprMark({ size = 34 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '10px',
        background: 'linear-gradient(145deg, #22C55E 0%, #16A34A 100%)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        {/* open orbit ring */}
        <path
          d="M20.5 12a8.5 8.5 0 1 1-3.2-6.63"
          stroke="#F5F6F8"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* satellite dot on the open end */}
        <circle cx="19.2" cy="4.2" r="2.4" fill="#EAB308" />
      </svg>
    </Box>
  );
}

/** Sidebar / drawer wordmark: mark + "Loopr". */
export function LooprWordmark({ size = 'md', color = '#F5F6F8' }: { size?: 'sm' | 'md'; color?: string }) {
  const markSize = size === 'sm' ? 30 : 34;
  const labelSize = size === 'sm' ? 16 : 18;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'default' }}>
      <LooprMark size={markSize} />
      <Typography
        sx={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 800,
          fontSize: labelSize,
          letterSpacing: '-0.02em',
          color,
          userSelect: 'text',
          lineHeight: 1,
        }}
      >
        Loopr
      </Typography>
    </Box>
  );
}
