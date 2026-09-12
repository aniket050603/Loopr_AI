import { useSyncExternalStore } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// Module-level store so any component can raise alerts without prop drilling.
type Listener = () => void;

export type AlertSeverity = 'error' | 'success' | 'info' | 'warning';

let currentAlert: { message: string; severity: AlertSeverity; key: number } | null = null;
const listeners = new Set<Listener>();
let counter = 0;

function emit(message: string, severity: AlertSeverity) {
  currentAlert = { message, severity, key: ++counter };
  listeners.forEach((listener) => listener());
}

export function showAlert(message: string, severity: AlertSeverity = 'error') {
  emit(message, severity);
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const alert = useSyncExternalStore(
    subscribe,
    () => currentAlert,
    () => null,
  );

  return (
    <>
      {children}
      <Snackbar
        key={alert?.key}
        open={alert !== null}
        autoHideDuration={5000}
        onClose={() => {
          currentAlert = null;
          listeners.forEach((listener) => listener());
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {alert ? (
          <Alert severity={alert.severity} variant="filled" sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        ) : (
          undefined
        )}
      </Snackbar>
    </>
  );
}
