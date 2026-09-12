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
import { api } from '../api/client';
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
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Configure CSV Export</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Choose which columns to include. Current table filters and sorting are applied to the
          export.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 1 }}>
          {TRANSACTION_FIELDS.map((field) => (
            <FormControlLabel
              key={field}
              control={
                <Checkbox
                  checked={selected.has(field)}
                  onChange={() => toggle(field)}
                />
              }
              label={LABELS[field]}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={selected.size === 0 || loading}
        >
          {loading ? 'Exporting…' : 'Export CSV'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
