import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { SnackbarProvider } from './components/SnackbarHost';
import { ThemeModeProvider } from './theme/ThemeModeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <CssBaseline />
        <SnackbarProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
