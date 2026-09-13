import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Wallet, Shield, CreditCard, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BrutalCard } from './ui';
import { getPalette, FONT_DISPLAY, FONT_MONO, FONT_UI, type BrutalPalette } from '../theme/theme';
import { useLedgerMode } from '../theme/ThemeModeProvider';
import { useCountUp, useSpotlight } from './motion';
import type { SummaryResponse } from '../types';

interface KpiCardDef {
  label: string;
  icon: React.ElementType;
  /** Raw number animated by useCountUp. */
  figure: number;
  direction: 'up' | 'down';
  sub: string;
  tint: (p: BrutalPalette) => string;
}

export default function KpiCards({ summary }: { summary: SummaryResponse }) {
  const { mode } = useLedgerMode();
  const p = getPalette(mode);
  const { metrics } = summary;

  const paidCount = metrics.transactionCount - metrics.pendingCount;

  const cards: KpiCardDef[] = useMemo(
    () => [
      {
        label: 'Balance',
        icon: Wallet,
        figure: metrics.netBalance,
        direction: metrics.netBalance >= 0 ? 'up' : 'down',
        sub: `${metrics.transactionCount.toLocaleString('en-US')} transactions`,
        tint: (pal) => pal.green,
      },
      {
        label: 'Revenue',
        icon: Shield,
        figure: metrics.totalRevenue,
        direction: 'up',
        sub: `${metrics.transactionCount} entries`,
        tint: (pal) => pal.green,
      },
      {
        label: 'Expenses',
        icon: CreditCard,
        figure: metrics.totalExpenses,
        direction: 'down',
        sub: `${metrics.transactionCount} entries`,
        tint: (pal) => pal.amber,
      },
      {
        label: 'Savings',
        icon: Coins,
        figure: metrics.netBalance,
        direction: metrics.netBalance >= 0 ? 'up' : 'down',
        sub: `${paidCount} settled`,
        tint: (pal) => pal.green,
      },
    ],
    [metrics, paidCount],
  );

  const counts = [
    useCountUp(metrics.netBalance, 1000, 0),
    useCountUp(metrics.totalRevenue, 1000, 0),
    useCountUp(metrics.totalExpenses, 1000, 0),
    useCountUp(metrics.netBalance, 1000, 0),
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, md: 2 },
      }}
    >
      {cards.map((card, idx) => (
        <KpiCard
          key={card.label}
          card={card}
          tint={card.tint(p)}
          countText={counts[idx]}
          palette={p}
        />
      ))}
    </Box>
  );
}

function KpiCard({
  card,
  tint,
  countText,
  palette,
}: {
  card: KpiCardDef;
  tint: string;
  countText: string;
  palette: BrutalPalette;
}) {
  const p = palette;
  const Icon = card.icon;
  const arrow = card.direction === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />;
  const { spotlight, spotlightSx } = useSpotlight();
  // useCountUp returns a plain number string; attach the currency sign the ledger way.
  const display = countText.startsWith('-') ? `-$${countText.slice(1)}` : `$${countText}`;

  return (
    <BrutalCard
      {...spotlight}
      sx={{
        ...spotlightSx,
        minHeight: { xs: 118, md: 132 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        py: { xs: 1.75, md: 2.25 },
        px: { xs: 1.5, md: 2 },
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px ${tint}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          sx={{
            width: { xs: 34, md: 38 },
            height: { xs: 34, md: 38 },
            borderRadius: '10px',
            bgcolor: p.panelAlt,
            display: 'grid',
            placeItems: 'center',
            color: tint,
            transition: 'transform 0.15s ease',
            '&:hover': { transform: 'scale(1.06)' },
          }}
        >
          <Icon size={18} strokeWidth={2.25} />
        </Box>
        <Box sx={{ color: tint, display: 'grid', placeItems: 'center' }}>{arrow}</Box>
      </Box>

      <Box>
        <Typography
          sx={{
            fontFamily: FONT_MONO,
            fontSize: 10.5,
            color: p.muted,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            mb: 0.4,
          }}
        >
          {card.label}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: { xs: 20, sm: 24, md: 26 },
            color: p.text,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {display}
        </Typography>
        <Typography
          sx={{
            fontFamily: FONT_UI,
            fontSize: 11,
            color: p.muted,
            mt: 0.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {card.sub}
        </Typography>
      </Box>
    </BrutalCard>
  );
}
