import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/login');
      return;
    }
    if (!loading && user && (!user.isApproved || user.isBlocked || user.accessExpired)) {
      setLocation('/login');
      return;
    }
    if (!loading && user?.mustChangePassword && location !== '/change-password') {
      setLocation('/change-password');
    }
  }, [loading, isAuthenticated, location, setLocation, user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  }
  if (!isAuthenticated || !user?.isApproved || user.isBlocked || user.accessExpired || (user.mustChangePassword && location !== '/change-password')) {
    return null;
  }
  return <Component />;
}
