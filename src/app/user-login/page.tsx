'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/common/PublicHeader';
import LoginHeader from './components/LoginHeader';
import LoginInteractive from './components/LoginInteractive';
import { useAuth } from '@/contexts/AuthContext';

export default function UserLoginPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && user) {
      // Redirect based on role
      const redirectPath = role === 'admin' || role === 'instructor'
        ? '/admin-dashboard'
        : '/student-dashboard';
      router.push(redirectPath);
    }
  }, [user, role, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </main>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <LoginHeader />
          <LoginInteractive />
        </div>
      </main>
    </div>
  );
}