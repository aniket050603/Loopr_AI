import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { FONT_MONO } from '../theme/theme';

/** Numbered section label with a rule underneath, e.g. "01  Overview". */
export function SectionHeader({
  index,
  title,
  meta,
  action,
}: {
  index: string;
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 1.5,
        flexWrap: 'wrap',
        pb: 1.25,
        mb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 600,
          color: 'text.secondary',
          letterSpacing: '0.08em',
        }}
      >
        {index}
      </Typography>
      <Typography component="h2" variant="h6" sx={{ lineHeight: 1.2 }}>
        {title}
      </Typography>
      {meta ? (
        <Typography
          component="span"
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 11.5,
            color: 'text.secondary',
            display: { xs: 'none', sm: 'inline' },
          }}
        >
          {meta}
        </Typography>
      ) : null}
      {action ? <Box sx={{ ml: 'auto' }}>{action}</Box> : null}
    </Box>
  );
}

/** Small solid dot used in table status/category pills; `pulse` adds a radar halo for live states. */
export function Dot({ color, size = 7, pulse = false }: { color: string; size?: number; pulse?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        flexShrink: 0,
        ...(pulse && {
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            border: `1.5px solid ${color}`,
            animation: 'dotPulse 1.8s ease-out infinite',
            '@keyframes dotPulse': {
              '0%': { transform: 'scale(0.6)', opacity: 0.9 },
              '70%, 100%': { transform: 'scale(1.7)', opacity: 0 },
            },
          },
        }),
      }}
    />
  );
}

/** Signed amount rendering: "+ $ 1,500.00" with dimmed currency glyph. */
export function Signed({
  value,
  currency,
  sign,
}: {
  value: string;
  currency: string;
  sign: '+' | '−';
}) {
  const theme = useTheme();
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.5,
        fontVariantNumeric: 'tabular-nums',
        color: sign === '+' ? 'success.main' : 'text.primary',
      }}
    >
      <Box
        component="span"
        sx={{
          fontFamily: FONT_MONO,
          fontSize: '0.72em',
          fontWeight: 600,
          opacity: sign === '+' ? 1 : 0.45,
        }}
      >
        {sign}
      </Box>
      <Box component="span" sx={{ opacity: 0.55, fontSize: '0.8em' }}>
        {currency}
      </Box>
      {value}
    </Box>
  );
}
