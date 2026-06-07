import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { auth } = useAuth();
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
}