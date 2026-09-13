import Box from '@mui/material/Box';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { getPalette, type BrutalPalette } from '../theme/theme';

function useBrutal(): BrutalPalette {
  const { mode } = useLedgerMode();
  return getPalette(mode);
}

/** Figma-style card: paper surface, 1px edge, soft elevation. */
export function BrutalCard({
  children,
  sx,
  ...rest
}: {
  children: React.ReactNode;
  sx?: Record<string, unknown>;
} & React.HTMLAttributes<HTMLDivElement>) {
  const p = useBrutal();
  return (
    <Box
      component="article"
      sx={{
        bgcolor: p.paper,
        padding: 2,
        borderRadius: '13px',
        border: `1px solid ${p.edge}`,
        boxShadow: '0 8px 26px rgba(0,0,0,0.3)',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
