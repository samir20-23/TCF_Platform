'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/common/PublicHeader';
import RegistrationForm from './components/RegistrationForm';
import TrustSignals from './components/TrustSignals';
import RegistrationBenefits from './components/RegistrationBenefits';
import { useAuth } from '@/contexts/AuthContext';
import PlanCards from '../pricing-plans/components/planCards';

export default function UserRegistrationPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      const redirectPath = role === 'admin' || role === 'instructor'
        ? '/admin-dashboard'
        : '/student-dashboard';
      router.push(redirectPath);
    }
  }, [user, role, loading, router]);

  if (loading) {
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

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* <RegistrationForm /> */}
            <TrustSignals />
          </div>

          <div className="flex items-center justify-center">
            <RegistrationBenefits />
          </div>
        </div>
        <div className="mt-16 rounded-lg bg-card p-8 text-center shadow-academic">
          <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
            Besoin d'aide pour vous inscrire ?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Notre équipe est disponible pour répondre à toutes vos questions sur le processus d'inscription et nos offres de préparation.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <a
              href="mailto:support@tcfcanada....com"
              className="inline-flex items-center space-x-2 rounded-md bg-muted px-6 py-3 font-caption text-sm font-medium text-foreground transition-academic hover:-translate-y-0.5 hover:shadow-academic-sm"
            >
              <span>support@tcfcanada....com</span>
            </a>
            <a
              href="tel:+15141234567"
              className="inline-flex items-center space-x-2 rounded-md bg-muted px-6 py-3 font-caption text-sm font-medium text-foreground transition-academic hover:-translate-y-0.5 hover:shadow-academic-sm"
            >
              <span>+1 (514....-4567</span>
            </a>
          </div>
        </div>
      </main>
      <PlanCards />

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center font-caption text-sm text-muted-foreground">
            © {new Date().getFullYear()} TCF Canada. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}