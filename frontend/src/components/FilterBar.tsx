import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';
import { FONT_MONO } from '../theme/theme';
import { usePalette } from '../theme/ThemeModeProvider';
import { debounce } from '../utils/debounce';
import type { TransactionFilters } from '../types';

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

const USER_IDS = ['user_001', 'user_002', 'user_003', 'user_004'];

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '6px' },
  '& .MuiInputLabel-root': { fontSize: 13.5 },
} as const;

function SegGroup({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: Array<{ v: string; l: string }>;
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography
        sx={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          minWidth: 64,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: 'inline-flex',
          gap: '2px',
          p: '2px',
          bgcolor: (t) => alpha(t.palette.text.primary, 0.045),
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 999,
        }}
      >
        {options.map((o) => {
          const active = value === o.v;
          return (
            <Button
              key={o.v}
              size="small"
              onClick={() => onPick(o.v)}
              sx={{
                minWidth: 0,
                px: 1.5,
                py: 0.3,
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 999,
                transition: 'all 0.18s ease',
                color: (t) => (active ? t.palette.background.paper : 'text.secondary'),
                bgcolor: (t) => (active ? t.palette.text.primary : 'transparent'),
                '&:hover': {
                  bgcolor: (t) =>
                    active ? t.palette.text.primary : alpha(t.palette.text.primary, 0.06),
                },
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              {o.l}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const palette = usePalette();
  const [searchDraft, setSearchDraft] = useState(filters.search ?? '');

  const pushSearch = debounce((value: string) => {
    onChange({ ...filters, search: value || undefined });
  }, 350);

  function update<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function handleReset() {
    setSearchDraft('');
    onChange({
      category: undefined,
      status: undefined,
      userId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      search: undefined,
    });
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, md: 3 },
          flexWrap: 'wrap',
          alignItems: 'center',
          mb: 1.75,
        }}
      >
        <SegGroup
          label="Category"
          value={filters.category ?? ''}
          onPick={(v) => update('category', v || undefined)}
          options={[
            { v: '', l: 'All' },
            { v: 'Revenue', l: 'Revenue' },
            { v: 'Expense', l: 'Expense' },
          ]}
        />
        <SegGroup
          label="Status"
          value={filters.status ?? ''}
          onPick={(v) => update('status', v || undefined)}
          options={[
            { v: '', l: 'All' },
            { v: 'Paid', l: 'Paid' },
            { v: 'Pending', l: 'Pending' },
          ]}
        />
        {hasActiveFilters ? (
          <Button
            size="small"
            onClick={handleReset}
            sx={{
              ml: 'auto',
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: '0.08em',
              px: 1.5,
              minWidth: 0,
              whiteSpace: 'nowrap',
              borderRadius: 999,
              border: `1px solid ${palette.borderStrong}`,
              color: 'text.secondary',
              '&:hover': { color: 'error.main', borderColor: 'error.main' },
              '&:active': { transform: 'scale(0.96)' },
              transition: 'all 0.18s ease',
            }}
          >
            CLR
          </Button>
        ) : null}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="Search all fields…"
          value={searchDraft}
          onChange={(e) => {
            setSearchDraft(e.target.value);
            pushSearch(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '8px', fontSize: 14 },
          }}
          sx={{ ...fieldSx, gridColumn: { xs: 'span 2', md: 'span 2' } }}
        />

        <TextField
          select
          size="small"
          label="User"
          value={filters.userId ?? ''}
          onChange={(e) => update('userId', e.target.value || undefined)}
          sx={fieldSx}
        >
          <MenuItem value="">All users</MenuItem>
          {USER_IDS.map((id) => (
            <MenuItem key={id} value={id}>
              {id}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          label="From date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.dateFrom ?? ''}
          onChange={(e) => update('dateFrom', e.target.value || undefined)}
          sx={fieldSx}
        />

        <TextField
          size="small"
          label="To date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.dateTo ?? ''}
          onChange={(e) => update('dateTo', e.target.value || undefined)}
          sx={fieldSx}
        />

        <TextField
          size="small"
          label="Min amount"
          type="number"
          value={filters.minAmount ?? ''}
          onChange={(e) => update('minAmount', e.target.value || undefined)}
          sx={fieldSx}
        />

        <TextField
          size="small"
          label="Max amount"
          type="number"
          value={filters.maxAmount ?? ''}
          onChange={(e) => update('maxAmount', e.target.value || undefined)}
          sx={fieldSx}
        />

        <Typography
          sx={{
            display: { xs: 'none', md: 'block' },
            fontFamily: FONT_MONO,
            fontSize: 11,
            lineHeight: 1.5,
            color: 'text.secondary',
            opacity: 0.8,
            pl: 1,
          }}
        >
          Filters apply to the table and CSV export alike.
        </Typography>
      </Box>
    </Box>
  );
}
