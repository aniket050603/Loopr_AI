import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { alpha } from '@mui/material/styles';
import { debounce } from '../utils/debounce';
import type { TransactionFilters } from '../types';

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

const USER_IDS = ['user_001', 'user_002', 'user_003', 'user_004'];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
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
    <Box
      sx={{
        display: 'grid',
        gap: 1.25,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
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
        }}
        sx={{
          gridColumn: { xs: '1', md: 'span 2' },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
          },
        }}
      />

      <TextField
        select
        size="small"
        label="Category"
        value={filters.category ?? ''}
        onChange={(e) => update('category', e.target.value || undefined)}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Revenue">Revenue</MenuItem>
        <MenuItem value="Expense">Expense</MenuItem>
      </TextField>

      <TextField
        select
        size="small"
        label="Status"
        value={filters.status ?? ''}
        onChange={(e) => update('status', e.target.value || undefined)}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Paid">Paid</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
      </TextField>

      <TextField
        select
        size="small"
        label="User"
        value={filters.userId ?? ''}
        onChange={(e) => update('userId', e.target.value || undefined)}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
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
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      />

      <TextField
        size="small"
        label="To date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={filters.dateTo ?? ''}
        onChange={(e) => update('dateTo', e.target.value || undefined)}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      />

      <TextField
        size="small"
        label="Min amount"
        type="number"
        value={filters.minAmount ?? ''}
        onChange={(e) => update('minAmount', e.target.value || undefined)}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
      />

      <Box sx={{ display: 'flex', gap: 1.25 }}>
        <TextField
          size="small"
          label="Max amount"
          type="number"
          value={filters.maxAmount ?? ''}
          onChange={(e) => update('maxAmount', e.target.value || undefined)}
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleReset}
          disabled={!hasActiveFilters}
          sx={{
            borderRadius: 2.5,
            px: 2,
            whiteSpace: 'nowrap',
            color: hasActiveFilters ? 'text.primary' : 'text.disabled',
            borderColor: (t) =>
              hasActiveFilters
                ? alpha(t.palette.primary.main, 0.5)
                : alpha(t.palette.text.secondary, 0.25),
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
