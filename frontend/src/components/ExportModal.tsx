import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, alpha } from '@mui/material/styles';
import { FONT_DISPLAY, FONT_MONO } from '../theme/theme';
import { usePalette } from '../theme/ThemeModeProvider';
import { api } from '../api/client';
import { showAlert } from './SnackbarHost';
import { TRANSACTION_FIELDS, type TransactionField } from '../types';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  queryString: string;
}

const LABELS: Record<TransactionField, string> = {
  id: 'No.',
  date: 'Date',
  amount: 'Amount',
  category: 'Category',
  status: 'Status',
  user_id: 'User ID',
  user_profile: 'User Profile',
};

export default function ExportModal({ open, onClose, queryString }: ExportModalProps) {
  const theme = useTheme();
  const palette = usePalette();
  const [selected, setSelected] = useState<Set<TransactionField>>(
    () => new Set(TRANSACTION_FIELDS),
  );
  const [loading, setLoading] = useState(false);

  function toggle(field: TransactionField) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }

  async function handleExport() {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      const response = await api.post(
        '/transactions/export/csv',
        { columns: [...selected] },
        {
          responseType: 'blob',
          // Re-apply the dashboard's current filters to the export.
          params: new URLSearchParams(queryString),
        },
      );

      const blob = new Blob([response.data as BlobPart], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions-export.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showAlert('CSV exported', 'success');
      onClose();
    } catch {
      showAlert('Export failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const allSelected = selected.size === TRANSACTION_FIELDS.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          bgcolor: 'background.paper',
          border: `1px solid ${palette.borderStrong}`,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600 }}>
          Export CSV
        </Typography>
        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11.5, color: 'text.secondary', mt: 0.5 }}>
          Columns + current filters &amp; sorting apply
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Button
            size="small"
            onClick={() => setSelected(allSelected ? new Set() : new Set(TRANSACTION_FIELDS))}
            sx={{ fontFamily: FONT_MONO, fontSize: 11, minWidth: 0 }}
          >
            {allSelected ? 'CLEAR' : 'ALL'}
          </Button>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.25 }}>
          {TRANSACTION_FIELDS.map((field) => {
            const checked = selected.has(field);
            return (
              <FormControlLabel
                key={field}
                sx={{
                  mx: -0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                  transition: 'background-color 0.12s ease',
                  '&:hover': { bgcolor: (t) => alpha(t.palette.text.primary, 0.04) },
                }}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={() => toggle(field)}
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-checked': { color: 'primary.main' },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5 }}>{LABELS[field]}</Typography>
                }
              />
            );
          })}
        </Box>
        <Typography sx={{ fontFamily: FONT_MONO, fontSize: 11, color: 'text.secondary', mt: 1.5 }}>
          {selected.size} / {TRANSACTION_FIELDS.length} columns
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: '6px' }}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          disabled={selected.size === 0 || loading}
          sx={{ borderRadius: '6px', px: 2.5 }}
        >
          {loading ? 'Exporting…' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
