import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { alpha, useTheme } from '@mui/material/styles';
import type { SummaryResponse } from '../types';

interface CardConfig {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export default function SummaryCards({ summary }: { summary: SummaryResponse }) {
  const theme = useTheme();
  const { metrics } = summary;

  const cards: CardConfig[] = [
    {
      label: 'Total Revenue',
      value: currency.format(metrics.totalRevenue),
      icon: <TrendingUpIcon />,
      color: theme.palette.success.main,
    },
    {
      label: 'Total Expenses',
      value: currency.format(metrics.totalExpenses),
      icon: <TrendingDownIcon />,
      color: theme.palette.error.main,
    },
    {
      label: 'Net Balance',
      value: currency.format(metrics.netBalance),
      icon: <AccountBalanceIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: 'Transactions',
      value: String(metrics.transactionCount),
      icon: <ReceiptLongIcon />,
      color: theme.palette.info.main,
    },
    {
      label: 'Pending',
      value: String(metrics.pendingCount),
      icon: <HourglassEmptyIcon />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
        gap: 2,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          elevation={0}
          sx={{
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: (t) => alpha(card.color, 0.22),
            background: (t) =>
              `linear-gradient(160deg, ${alpha(card.color, 0.13)} 0%, ${alpha(
                card.color,
                0.04,
              )} 45%, ${alpha(t.palette.background.paper, 0.9)} 100%)`,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: `0 14px 34px ${alpha(card.color, 0.22)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${card.color}, ${alpha(card.color, 0.2)})`,
            },
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                display: 'grid',
                placeItems: 'center',
                mb: 1.5,
                color: card.color,
                bgcolor: alpha(card.color, 0.14),
                border: '1px solid',
                borderColor: alpha(card.color, 0.25),
              }}
            >
              {card.icon}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: 10.5,
              }}
            >
              {card.label}
            </Typography>
            <Typography
              variant="h6"
              fontWeight={800}
              letterSpacing="-0.02em"
              sx={{ fontVariantNumeric: 'tabular-nums', mt: 0.25 }}
            >
              {card.value}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
