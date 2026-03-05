'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import LoginLinks from './LoginLinks';

const LoginInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const { signIn, resendVerification, profileError, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsHydrated(true);

    // Check for URL messages
    const message = searchParams.get('message');
    if (message === 'check-email') {
      setSuccessMessage('Vérifiez votre email pour confirmer votre compte.');
    }
  }, [searchParams]);

  const handleResend = async () => {
    if (!currentEmail || resendLoading) return;
    setResendLoading(true);
    try {
      const { error: resendError } = await resendVerification(currentEmail);
      if (resendError) throw resendError;
      setSuccessMessage('E-mail de vérification renvoyé !');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    if (!isHydrated || isLoading) return;

    setCurrentEmail(email);
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await signIn(email, password);
      // Navigation is handled in AuthContext
    } catch (err: unknown) {
      console.error('Login error:', err);

      // Parse Supabase error messages for user-friendly display
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';

      if (errorMessage.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter.');
      } else if (errorMessage.includes('Too many requests')) {
        setError('Trop de tentatives. Réessayez dans quelques minutes.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (!isHydrated || authLoading) {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-lg bg-card p-8 shadow-academic-lg">
          <div className="space-y-6">
            <div className="h-32 animate-pulse rounded-md bg-muted"></div>
            <div className="h-64 animate-pulse rounded-md bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile error if exists (user logged in but no profile)
  const displayError = profileError || error;

  return (
    <div className="w-full max-w-md space-y-8">
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
          {successMessage}
        </div>
      )}

      <div className="rounded-lg bg-card p-8 shadow-academic-lg">
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={displayError} />

        {error.includes('confirmer votre email') && (
          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm font-medium text-primary hover:underline transition-all disabled:opacity-50"
            >
              {resendLoading ? 'Envoi...' : 'Renvoyer l\'e-mail de vérification'}
            </button>
          </div>
        )}

        <div className="mt-6">

          <LoginLinks />
        </div>
      </div>
    </div>
  );
};

export default LoginInteractive;
