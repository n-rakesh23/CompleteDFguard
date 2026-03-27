import { Navigate }       from 'react-router-dom';
import { useAuth }         from '../../hooks/useAuth';
import { FullPageSpinner } from '../ui/Spinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageSpinner />;

  // Redirect to login — real protection enforced by backend JWT
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
