'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
  allowAdminOverride?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  allowAdminOverride = true 
}: ProtectedRouteProps) {
  const { user, role, ready, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready || loading) return;

    // No user - redirect to login
    if (!user) {
      router.push('/user-login');
      return;
    }

    // Role check (only admin and student exist in the new schema)
    if (requiredRole) {
      const hasAccess =
        role === requiredRole ||
        (allowAdminOverride && role === 'admin');

      if (!hasAccess) {
        router.push('/not-authorized');
        return;
      }
    }
  }, [user, role, ready, loading, requiredRole, allowAdminOverride, router]);

  // Show loading while checking auth
  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // No user - show nothing (redirecting)
  if (!user) {
    return null;
  }

  // Role check failed - show nothing (redirecting)
  if (requiredRole) {
    const hasAccess =
      role === requiredRole ||
      (allowAdminOverride && role === 'admin');

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}
