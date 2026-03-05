'use client';

import { useState, useEffect } from 'react';

import Icon from '@/components/ui/AppIcon';

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => void;
  isLoading: boolean;
  error: string;
}

const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'L\'adresse e-mail est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Veuillez entrer une adresse e-mail valide';
    }

    if (!password.trim()) {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email, password, rememberMe);
    }
  };

  if (!isHydrated) {
    return (
      <form className="space-y-6">
        <div>
          <label className="mb-2 block font-caption text-sm font-medium text-foreground">
            Adresse e-mail
          </label>
          <div className="relative">
            <input
              type="email"
              className="w-full rounded-md border border-input bg-background px-4 py-3 pl-11 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-caption text-sm font-medium text-foreground">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type="password"
              className="w-full rounded-md border border-input bg-background px-4 py-3 pl-11 pr-11 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled
            />
          </div>
        </div>

        <button
          type="submit"
          disabled
          className="w-full rounded-md bg-primary px-6 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic"
        >
          Connexion
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-caption text-sm font-medium text-foreground"
        >
          Adresse e-mail
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="EnvelopeIcon" size={20} className="text-muted-foreground" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors({ ...validationErrors, email: undefined });
              }
            }}
            className={`w-full rounded-md border px-4 py-3 pl-11 font-caption text-sm text-foreground transition-academic focus:outline-none focus:ring-2 ${
              validationErrors.email
                ? 'border-error bg-error/5 focus:border-error focus:ring-error/20' :'border-input bg-background focus:border-primary focus:ring-primary/20'
            }`}
            placeholder="votre.email@exemple.com"
            disabled={isLoading}
          />
        </div>
        {validationErrors.email && (
          <p className="mt-1 flex items-center space-x-1 font-caption text-xs text-error">
            <Icon name="ExclamationCircleIcon" size={14} />
            <span>{validationErrors.email}</span>
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-caption text-sm font-medium text-foreground"
        >
          Mot de passe
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="LockClosedIcon" size={20} className="text-muted-foreground" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors({ ...validationErrors, password: undefined });
              }
            }}
            className={`w-full rounded-md border px-4 py-3 pl-11 pr-11 font-caption text-sm text-foreground transition-academic focus:outline-none focus:ring-2 ${
              validationErrors.password
                ? 'border-error bg-error/5 focus:border-error focus:ring-error/20' :'border-input bg-background focus:border-primary focus:ring-primary/20'
            }`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-academic hover:text-foreground"
            disabled={isLoading}
          >
            <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
          </button>
        </div>
        {validationErrors.password && (
          <p className="mt-1 flex items-center space-x-1 font-caption text-xs text-error">
            <Icon name="ExclamationCircleIcon" size={14} />
            <span>{validationErrors.password}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary transition-academic focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
          <span className="font-caption text-sm text-foreground">Se souvenir de moi</span>
        </label>
      </div>

      {error && (
        <div className="rounded-md bg-error/10 p-4">
          <div className="flex items-start space-x-3">
            <Icon name="ExclamationTriangleIcon" size={20} className="text-error" />
            <p className="font-caption text-sm text-error">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-primary px-6 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md disabled:translate-y-0 disabled:opacity-50 disabled:shadow-academic"
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-2">
            <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
            <span>Connexion en cours...</span>
          </span>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
};

export default LoginForm;