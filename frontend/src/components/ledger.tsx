import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { FONT_MONO } from '../theme/theme';

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

export function Dot({ color, size = 7 }: { color: string; size?: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        flexShrink: 0,
      }}
    />
  );
}

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

export function Sparkline({
  data,
  width = 120,
  height = 34,
  stroke,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 4) + 2;
      const y = height - 3 - ((v - min) / span) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} aria-hidden style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={pts.split(' ').slice(-1)[0].split(',')[0]}
        cy={pts.split(' ').slice(-1)[0].split(',')[1]}
        r={2.2}
        fill={stroke}
      />
    </svg>
  );
}

export function StatBlock({
  label,
  children,
  align = 'left',
}: {
  label: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: { xs: 1.75, md: 2 },
        borderLeft: { md: `1px solid ${theme.palette.divider}` },
        borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
        textAlign: align,
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontSize: 10.5,
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}
