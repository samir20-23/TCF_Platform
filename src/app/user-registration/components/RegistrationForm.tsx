'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

interface RegistrationFormProps {
  onSubmit?: (data: RegistrationData) => void;
}

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
}

const RegistrationForm = ({ onSubmit }: RegistrationFormProps) => {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!isHydrated) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const colors = ['bg-error', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success'];

    return {
      strength: (strength / 5) * 100,
      label: labels[Math.min(strength, 4)],
      color: colors[Math.min(strength, 4)],
    };
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom complet est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'adresse e-mail est requise';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      await signUp(formData.email, formData.password, formData.name);

      setSuccessMessage(
        'Inscription réussie! Vérifiez votre e-mail pour confirmer votre compte avant de vous connecter.'
      );

      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/user-login');
      }, 3000);
    } catch (err: any) {
      setErrors({ email: err.message || 'Une erreur est survenue lors de l\'inscription' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-academic-lg">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">Créer un compte</h1>
          <p className="mt-2 text-muted-foreground">Commencez votre préparation TCF Canada</p>
        </div>
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded-md bg-muted"></div>
          <div className="h-12 animate-pulse rounded-md bg-muted"></div>
          <div className="h-12 animate-pulse rounded-md bg-muted"></div>
          <div className="h-12 animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-academic-lg">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">Créer un compte</h1>
        <p className="mt-2 text-muted-foreground">Commencez votre préparation TCF Canada</p>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center space-x-3 rounded-md bg-success/10 p-4 text-success">
          <Icon name="CheckCircleIcon" size={20} />
          <span className="font-caption text-sm">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-2 block font-caption text-sm font-medium text-foreground">
            Nom complet <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full rounded-md border px-4 py-3 font-caption text-sm transition-academic focus:outline-none focus:ring-2 ${errors.name
                ? 'border-error focus:ring-error' : 'border-input focus:ring-ring'
              }`}
            placeholder="Jean Dupont"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 font-caption text-xs text-error">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-caption text-sm font-medium text-foreground">
            Adresse e-mail <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full rounded-md border px-4 py-3 pl-11 font-caption text-sm transition-academic focus:outline-none focus:ring-2 ${errors.email
                  ? 'border-error focus:ring-error' : 'border-input focus:ring-ring'
                }`}
              placeholder="jean.dupont@exemple.com"
              disabled={isLoading}
            />
            <Icon
              name="EnvelopeIcon"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          {errors.email && (
            <p className="mt-1 font-caption text-xs text-error">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block font-caption text-sm font-medium text-foreground">
            Mot de passe <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full rounded-md border px-4 py-3 pl-11 pr-11 font-caption text-sm transition-academic focus:outline-none focus:ring-2 ${errors.password
                  ? 'border-error focus:ring-error' : 'border-input focus:ring-ring'
                }`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <Icon
              name="LockClosedIcon"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-academic hover:text-foreground"
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-caption text-xs text-muted-foreground">
                  Force du mot de passe: {passwordStrength.label}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-academic ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
            </div>
          )}
          {errors.password && (
            <p className="mt-1 font-caption text-xs text-error">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block font-caption text-sm font-medium text-foreground">
            Confirmer le mot de passe <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full rounded-md border px-4 py-3 pl-11 pr-11 font-caption text-sm transition-academic focus:outline-none focus:ring-2 ${errors.confirmPassword
                  ? 'border-error focus:ring-error' : 'border-input focus:ring-ring'
                }`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <Icon
              name="LockClosedIcon"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-academic hover:text-foreground"
            >
              <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 font-caption text-xs text-error">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center space-x-2 rounded-md bg-primary px-6 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              <span>Création du compte...</span>
            </>
          ) : (
            <>
              <Icon name="UserPlusIcon" size={20} />
              <span>Créer mon compte</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className="text-muted-foreground">Vous avez déjà un compte ?</span>
          <Link
            href="/user-login"
            className="font-caption font-medium text-primary transition-academic hover:underline"
          >
            Se connecter
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="font-caption text-sm text-muted-foreground transition-academic hover:text-foreground hover:underline"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;