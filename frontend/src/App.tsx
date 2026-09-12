import { Navigate, Route, Routes } from 'react-router-dom';
import Container from '@mui/material/Container';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Container
              maxWidth="lg"
              sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1200 }}
            >
              <DashboardPage />
            </Container>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
