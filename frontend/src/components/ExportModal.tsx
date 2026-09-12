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
import DownloadIcon from '@mui/icons-material/Download';
import { alpha } from '@mui/material/styles';
import { api } from '../api/client';
import { showAlert } from './SnackbarHost';
import { TRANSACTION_FIELDS, type TransactionField } from '../types';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  queryString: string;
}

const LABELS: Record<TransactionField, string> = {
  id: 'ID',
  date: 'Date',
  amount: 'Amount',
  category: 'Category',
  status: 'Status',
  user_id: 'User ID',
  user_profile: 'User Profile',
};

export default function ExportModal({ open, onClose, queryString }: ExportModalProps) {
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
          borderRadius: 4,
          bgcolor: 'rgba(14,21,38,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148,163,184,0.16)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="subtitle1" component="div" fontWeight={800} letterSpacing="-0.01em">
          Export CSV
        </Typography>
        <Typography variant="caption" component="div" color="text.secondary">
          Columns + current filters &amp; sorting are applied
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Button
            size="small"
            onClick={() =>
              setSelected(
                allSelected ? new Set() : new Set(TRANSACTION_FIELDS),
              )
            }
            sx={{ fontSize: 12 }}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
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
                  py: 0.4,
                  borderRadius: 2,
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: 'rgba(148,163,184,0.07)' },
                }}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={() => toggle(field)}
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-checked': { color: 'primary.light' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: 13.5 }}>
                    {LABELS[field]}
                  </Typography>
                }
              />
            );
          })}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          {selected.size} of {TRANSACTION_FIELDS.length} columns selected
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2.5 }}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />
          }
          disabled={selected.size === 0 || loading}
          sx={{
            borderRadius: 2.5,
            color: '#fff',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #22D3EE 140%)',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            '&:disabled': { color: '#fff', opacity: 0.6 },
          }}
        >
          {loading ? 'Exporting…' : 'Export CSV'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
