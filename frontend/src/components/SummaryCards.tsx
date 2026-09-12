import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
      {cards.map((card) => (
        <Card
          key={card.label}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (t) => alpha(card.color, 0.06),
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: alpha(card.color, 0.15), color: card.color }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {card.value}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
