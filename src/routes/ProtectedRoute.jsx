import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export default function ProtectedRoute({ roles }) {
  const { accessToken, user } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}