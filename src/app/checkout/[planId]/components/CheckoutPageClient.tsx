'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────
interface Plan {
    id: string;
    name: string;
    price_cents: number;
    currency: string;
    duration_days: number;
    description: string;
    is_popular?: boolean;
    features?: string;
}

type PaymentProvider = 'stripe' | 'paypal' | 'Ria' | 'Orange Money' | 'western';

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

// ──────────────────────────────────────────
// Animations CSS injected globally
// ──────────────────────────────────────────
const animationStyles = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.88); }
    70%  { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulseBorder {
    0%, 100% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb, 99,102,241), 0.25); }
    50%       { box-shadow: 0 0 0 6px rgba(var(--primary-rgb, 99,102,241), 0); }
  }
  @keyframes tickIn {
    0%   { stroke-dashoffset: 40; opacity: 0; }
    60%  { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes spinOnce {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes barFill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  .anim-fade-slide-up  { animation: fadeSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-fade-slide-in  { animation: fadeSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-fade-in        { animation: fadeIn 0.4s ease both; }
  .anim-pop-in         { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
  .anim-float          { animation: float 3s ease-in-out infinite; }

  .stagger-1  { animation-delay: 0.05s; }
  .stagger-2  { animation-delay: 0.12s; }
  .stagger-3  { animation-delay: 0.19s; }
  .stagger-4  { animation-delay: 0.26s; }
  .stagger-5  { animation-delay: 0.33s; }
  .stagger-6  { animation-delay: 0.40s; }
  .stagger-7  { animation-delay: 0.47s; }
  .stagger-8  { animation-delay: 0.54s; }

  .input-field {
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  }
  .input-field:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }

  .payment-option-btn {
    transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.2s;
  }
  .payment-option-btn:hover {
    transform: translateX(3px);
  }
  .payment-option-btn.selected {
    animation: pulseBorder 1.2s ease forwards;
    transform: translateX(4px);
  }

  .submit-btn {
    transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
    background-size: 200% auto;
  }
  .submit-btn:not(:disabled):hover {
    transform: translateY(-2px) scale(1.015);
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  }
  .submit-btn:not(:disabled):active {
    transform: scale(0.97);
  }

  .badge-card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .badge-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.09);
  }

  .feature-row {
    transition: transform 0.15s, color 0.15s;
  }
  .feature-row:hover {
    transform: translateX(4px);
  }

  .strength-bar-fill {
    transform-origin: left;
    animation: barFill 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }

  .error-banner {
    animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .price-display {
    background: linear-gradient(90deg, currentColor 0%, currentColor 100%);
    background-clip: text;
    -webkit-background-clip: text;
  }

  .section-divider {
    position: relative;
  }
  .section-divider::before {
    content: '';
    position: absolute;
    left: 0; right: 0; top: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(128,128,128,0.2), transparent);
  }

  .logo-icon-wrap {
    transition: transform 0.3s;
  }
  .logo-icon-wrap:hover {
    transform: rotate(8deg) scale(1.1);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────
export default function CheckoutPageClient({ plan }: { plan: Plan }) {
    const router = useRouter();
    const { user, role } = useAuth();

    const [isHydrated, setIsHydrated] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [isLoginMode, setIsLoginMode] = useState(false);
    // Tracks when the user authenticated DURING this checkout session.
    // Prevents the useEffect from redirecting them away mid-payment.
    const [authenticatedDuringCheckout, setAuthenticatedDuringCheckout] = useState(false);

    const displayPrice = (plan.price_cents || 0) / 100;
    const features = (plan.description || '').split('\n').filter((f) => f.trim());
    const supabase = createClient();

    useEffect(() => {
        setIsHydrated(true);
        if (typeof window !== 'undefined') {
            if (localStorage.getItem('hasAccount') === 'true') {
                setIsLoginMode(true);
            }
        }
        // Inject animation styles once
        if (typeof document !== 'undefined') {
            const id = '__checkout_anim_styles__';
            if (!document.getElementById(id)) {
                const style = document.createElement('style');
                style.id = id;
                style.textContent = animationStyles;
                document.head.appendChild(style);
            }
        }
    }, []);

    useEffect(() => {
        // Redirect pre-authenticated users away (they should use the plan selection page).
        // But DON'T redirect if they just authenticated during this checkout flow.
        if (isHydrated && user && !isProcessing && !authenticatedDuringCheckout) {
            router.replace(`/pricing-plans?selectPlan=${plan.id}`);
        }
    }, [isHydrated, user, plan.id, router, isProcessing, authenticatedDuringCheckout]);

    // ──────────────────────────────────
    // Validation
    // ──────────────────────────────────
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const getPasswordStrength = (pwd: string) => {
        let s = 0;
        if (pwd.length >= 8) s++;
        if (pwd.length >= 12) s++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
        if (/\d/.test(pwd)) s++;
        if (/[^a-zA-Z0-9]/.test(pwd)) s++;
        const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
        const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500', 'bg-green-600'];
        return { strength: (s / 5) * 100, label: labels[Math.min(s, 4)], color: colors[Math.min(s, 4)] };
    };

    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!isLoginMode && !formData.name.trim()) errs.name = 'Le nom complet est requis';
        if (!formData.email.trim()) errs.email = "L'adresse e-mail est requise";
        else if (!validateEmail(formData.email)) errs.email = 'Adresse e-mail invalide';
        if (!formData.password) errs.password = 'Le mot de passe est requis';
        else if (!isLoginMode && formData.password.length < 8) errs.password = 'Minimum 8 caractères';
        else if (!isLoginMode && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
            errs.password = 'Doit contenir majuscule, minuscule et chiffre';
        if (!isLoginMode && !formData.confirmPassword) errs.confirmPassword = 'Veuillez confirmer votre mot de passe';
        else if (!isLoginMode && formData.password !== formData.confirmPassword)
            errs.confirmPassword = 'Les mots de passe ne correspondent pas';
        if (!selectedProvider) errs.general = 'Veuillez choisir un mode de paiement';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleInput = (field: keyof FormData, value: string) => {
        setFormData((p) => ({ ...p, [field]: value }));
        if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    };

    // ──────────────────────────────────
    // Submit
    // ──────────────────────────────────
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsProcessing(true);
        setAuthenticatedDuringCheckout(true); // Prevent redirect-away during this flow
        setErrors({});

        try {
            let userId: string | undefined;

            if (isLoginMode) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password
                });

                if (signInError) {
                    setErrors({ general: `Erreur de connexion: ${signInError.message}` });
                    setIsProcessing(false);
                    return;
                }
                userId = signInData.user?.id;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('hasAccount', 'true');
                }
            } else {
                const { data: signUpData, error: signUpError } = await signUp(
                    formData.email.trim().toLowerCase(),
                    formData.password,
                    formData.name.trim(),
                    { shouldRedirect: false }
                );

                if (signUpError) {
                    if (signUpError.message?.toLowerCase().includes('already registered') ||
                        signUpError.message?.toLowerCase().includes('already exists')) {
                        setErrors({ email: 'Un compte avec cet e-mail existe déjà. Veuillez vous connecter.' });
                    } else {
                        setErrors({ general: `Erreur d'inscription: ${signUpError.message}` });
                    }
                    setIsProcessing(false);
                    return;
                }
                userId = signUpData?.user?.id;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('hasAccount', 'true');
                }
            }

            if (!userId) {
                throw new Error("Impossible de récupérer l'ID de l'utilisateur après l'inscription/connexion.");
            }

            if (selectedProvider === 'stripe') {
                const res = await fetch('/api/payments/stripe/create-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planId: plan.id,
                        userId: userId,
                        successUrl: `${window.location.origin}/checkout/success?plan=${encodeURIComponent(plan.name)}`,
                        cancelUrl: `${window.location.origin}/checkout/${plan.id}?canceled=true`,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Erreur lors de la création du paiement');
                }

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error('URL de redirection manquante');
                }
            } else if (selectedProvider === 'paypal') {
                const res = await fetch('/api/payments/paypal/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planId: plan.id,
                        userId: userId,
                        successUrl: `${window.location.origin}/checkout/success?plan=${encodeURIComponent(plan.name)}`,
                        cancelUrl: `${window.location.origin}/checkout/${plan.id}?canceled=true`,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erreur PayPal');
                if (data.url) window.location.href = data.url;
                else throw new Error('URL PayPal manquante');
            } else {
                toast.success(
                    `Veuillez nous contacter à support@tcfcanada....com pour finaliser votre paiement via ${selectedProvider}.`,
                    { duration: 8000 }
                );
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            setErrors({ general: err.message || 'Une erreur est survenue. Veuillez réessayer.' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isHydrated) return null;

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <section className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="mb-8 flex items-center space-x-2 text-sm text-muted-foreground anim-fade-slide-in">
                    <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                    <Icon name="ChevronRightIcon" size={14} />
                    <Link href="/pricing-plans" className="hover:text-primary transition-colors">Plans tarifaires</Link>
                    <Icon name="ChevronRightIcon" size={14} />
                    <span className="text-foreground font-medium">Finaliser l'achat</span>
                </nav>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

                    {/* ── LEFT: Plan Summary ── */}
                    <div className="space-y-6">

                        {/* Plan card summary */}
                        <div
                            className={`rounded-2xl border-2 bg-card p-8 shadow-academic-lg anim-fade-slide-up stagger-1 ${plan.is_popular ? 'border-primary' : 'border-border'}`}
                            style={{ transition: 'box-shadow 0.3s' }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                        >
                            {plan.is_popular && (
                                <div className="mb-4 inline-flex items-center space-x-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground anim-pop-in">
                                    <span className="anim-float" style={{ display: 'inline-block' }}>
                                        <Icon name="SparklesIcon" size={12} />
                                    </span>
                                    <span>Plus populaire</span>
                                </div>
                            )}

                            <h2 className="mb-2 font-heading text-3xl font-bold text-foreground anim-fade-slide-up stagger-2">
                                Plan {plan.name}
                            </h2>
                            <p className="mb-6 text-muted-foreground text-sm anim-fade-slide-up stagger-3">
                                {plan.duration_days} jours d'accès complet
                            </p>

                            {/* Price */}
                            <div className="mb-6 flex items-baseline space-x-2 anim-fade-slide-up stagger-3">
                                <span className="font-heading text-5xl font-black text-primary" style={{ letterSpacing: '-0.02em' }}>
                                    {displayPrice.toFixed(2)}
                                </span>
                                <span className="font-caption text-xl font-medium text-muted-foreground">
                                    {plan.currency || 'MAD'}
                                </span>
                            </div>

                            {/* Features list */}
                            {features.length > 0 && (
                                <div className="space-y-3 anim-fade-slide-up stagger-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inclus dans ce plan</p>
                                    {features.map((feature, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-start space-x-3 feature-row anim-fade-slide-up`}
                                            style={{ animationDelay: `${0.3 + i * 0.07}s` }}
                                        >
                                            <Icon name="CheckCircleIcon" size={18} className="mt-0.5 shrink-0 text-green-500" />
                                            <span className="text-sm text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Security badges */}
                        <div className="grid grid-cols-3 gap-4 anim-fade-slide-up stagger-5">
                            {[
                                { icon: 'LockClosedIcon', label: 'Paiement sécurisé SSL' },
                                { icon: 'ShieldCheckIcon', label: 'Données protégées' },
                                { icon: 'AcademicCapIcon', label: 'Accès immédiat' },
                            ].map((badge, i) => (
                                <div
                                    key={badge.label}
                                    className={`badge-card flex flex-col items-center space-y-2 rounded-xl bg-muted/50 p-4 text-center anim-pop-in`}
                                    style={{ animationDelay: `${0.45 + i * 0.08}s` }}
                                >
                                    <span className="logo-icon-wrap" style={{ display: 'block' }}>
                                        <Icon name={badge.icon as any} size={22} className="text-primary" />
                                    </span>
                                    <span className="text-[11px] font-medium text-muted-foreground leading-tight">{badge.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Already have account */}
                        <div className="rounded-xl border border-border bg-card p-4 text-center anim-fade-in stagger-7" style={{ transition: 'border-color 0.2s' }}>
                            <p className="text-sm text-muted-foreground">
                                Vous avez déjà un compte ?{' '}
                                <Link
                                    href={`/user-login?redirect=${encodeURIComponent(`/pricing-plans?selectPlan=${plan.id}`)}`}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Connectez-vous ici
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* ── RIGHT: Registration + Payment ── */}
                    <div
                        className="rounded-2xl border border-border bg-card p-8 shadow-academic-lg anim-fade-slide-up stagger-2"
                        style={{ transition: 'box-shadow 0.3s' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.10)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                    >
                        <div className="mb-8 anim-fade-slide-up stagger-3">
                            <h1 className="font-heading text-2xl font-bold text-foreground flex items-center justify-between">
                                <span>{isLoginMode ? 'Connexion & paiement' : 'Créer votre compte & payer'}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginMode(!isLoginMode);
                                        setErrors({});
                                    }}
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    {isLoginMode ? "S'inscrire" : "Se connecter"}
                                </button>
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Remplissez vos informations pour finaliser l'achat du plan <strong>{plan.name}</strong>.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                            {/* General error */}
                            {errors.general && (
                                <div className="error-banner flex items-start space-x-3 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                                    <Icon name="ExclamationTriangleIcon" size={18} className="mt-0.5 shrink-0" />
                                    <span className="text-sm">{errors.general}</span>
                                </div>
                            )}

                            {/* ── Registration Fields ── */}
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 anim-fade-in stagger-4">
                                    Vos informations
                                </p>

                                {/* Name */}
                                {!isLoginMode && (
                                    <div className="anim-fade-slide-up stagger-4">
                                        <label htmlFor="checkout-name" className="mb-1.5 block text-sm font-medium text-foreground">
                                            Nom complet <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="checkout-name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInput('name', e.target.value)}
                                            placeholder="Jean Dupont"
                                            disabled={isProcessing}
                                            className={`input-field w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${errors.name ? 'border-red-400 focus:ring-red-300' : 'border-input focus:ring-ring'} bg-background`}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-500 anim-fade-slide-up">{errors.name}</p>
                                        )}
                                    </div>
                                )}

                                {/* Email */}
                                <div className="pt-1 anim-fade-slide-up stagger-5">
                                    <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium text-foreground">
                                        Adresse e-mail <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInput('email', e.target.value)}
                                            placeholder="jean.dupont@exemple.com"
                                            disabled={isProcessing}
                                            className={`input-field w-full rounded-lg border px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 ${errors.email ? 'border-red-400 focus:ring-red-300' : 'border-input focus:ring-ring'} bg-background`}
                                        />
                                        <Icon name="EnvelopeIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" style={{ transition: 'color 0.2s' }} />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-500 anim-fade-slide-up">
                                            {errors.email}{' '}
                                            {errors.email.includes('existe déjà') && (
                                                <Link href="/user-login" className="font-semibold underline">
                                                    Se connecter
                                                </Link>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="pt-1 anim-fade-slide-up stagger-6">
                                    <label htmlFor="checkout-password" className="mb-1.5 block text-sm font-medium text-foreground">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="checkout-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => handleInput('password', e.target.value)}
                                            placeholder="••••••••"
                                            disabled={isProcessing}
                                            className={`input-field w-full rounded-lg border px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 ${errors.password ? 'border-red-400 focus:ring-red-300' : 'border-input focus:ring-ring'} bg-background`}
                                        />
                                        <Icon name="LockClosedIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            style={{ transition: 'color 0.15s, transform 0.15s' }}
                                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)')}
                                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(-50%) scale(1)')}
                                        >
                                            <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                                        </button>
                                    </div>
                                    {!isLoginMode && formData.password && (
                                        <div className="mt-2 anim-fade-in">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    Force: <span style={{ fontWeight: 600 }}>{passwordStrength.label}</span>
                                                </span>
                                                <span className="text-xs text-muted-foreground">{Math.round(passwordStrength.strength)}%</span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    key={formData.password}
                                                    className={`h-full strength-bar-fill ${passwordStrength.color}`}
                                                    style={{ width: `${passwordStrength.strength}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {errors.password && <p className="mt-1 text-xs text-red-500 anim-fade-slide-up">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                {!isLoginMode && (
                                    <div className="pt-1 anim-fade-slide-up stagger-7">
                                        <label htmlFor="checkout-confirm" className="mb-1.5 block text-sm font-medium text-foreground">
                                            Confirmer le mot de passe <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="checkout-confirm"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInput('confirmPassword', e.target.value)}
                                                placeholder="••••••••"
                                                disabled={isProcessing}
                                                className={`input-field w-full rounded-lg border px-4 py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-300' : 'border-input focus:ring-ring'} bg-background`}
                                            />
                                            <Icon name="LockClosedIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                            {/* Animated match indicator */}
                                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                                <span className="absolute right-10 top-1/2 -translate-y-1/2 anim-pop-in">
                                                    <Icon name="CheckCircleIcon" size={16} className="text-green-500" />
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                style={{ transition: 'color 0.15s, transform 0.15s' }}
                                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)')}
                                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(-50%) scale(1)')}
                                            >
                                                <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 anim-fade-slide-up">{errors.confirmPassword}</p>}
                                    </div>
                                )}
                            </div>

                            {/* ── Payment Method ── */}
                            <div className="anim-fade-slide-up stagger-8">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Mode de paiement
                                </p>
                                <div className="space-y-2.5">
                                    <PaymentOption
                                        id="stripe"
                                        title="Carte Bancaire (Stripe)"
                                        subtitle="Visa, Mastercard, American Express"
                                        icon={<Icon name="CreditCardIcon" size={22} />}
                                        color="bg-indigo-600"
                                        selected={selectedProvider === 'stripe'}
                                        onClick={() => { setSelectedProvider('stripe'); setErrors((p) => ({ ...p, general: undefined })); }}
                                        recommended
                                    />
                                    <PaymentOption
                                        id="paypal"
                                        title="PayPal"
                                        subtitle="Paiement via votre compte PayPal"
                                        icon={<Icon name="CurrencyDollarIcon" size={22} />}
                                        color="bg-blue-500"
                                        selected={selectedProvider === 'paypal'}
                                        onClick={() => { setSelectedProvider('paypal'); setErrors((p) => ({ ...p, general: undefined })); }}
                                    />
                                    <PaymentOption
                                        id="Ria"
                                        title="Ria Money Transfer"
                                        subtitle="Paiement en espèces ou virement"
                                        imgSrc="/assets/iconsPayments/ria.png"
                                        selected={selectedProvider === 'Ria'}
                                        onClick={() => { setSelectedProvider('Ria'); setErrors((p) => ({ ...p, general: undefined })); }}
                                    />
                                    <PaymentOption
                                        id="Orange Money"
                                        title="Orange Money"
                                        subtitle="Paiement via mobile Orange Money"
                                        imgSrc="/assets/iconsPayments/orange.png"
                                        selected={selectedProvider === 'Orange Money'}
                                        onClick={() => { setSelectedProvider('Orange Money'); setErrors((p) => ({ ...p, general: undefined })); }}
                                    />
                                    <PaymentOption
                                        id="western"
                                        title="Western Union"
                                        subtitle="Transfert via Western Union"
                                        imgSrc="/assets/iconsPayments/western.png"
                                        selected={selectedProvider === 'western'}
                                        onClick={() => { setSelectedProvider('western'); setErrors((p) => ({ ...p, general: undefined })); }}
                                    />
                                </div>
                            </div>

                            {/* ── Submit ── */}
                            <div className="pt-2 anim-fade-slide-up stagger-8">
                                {/* Order summary */}
                                <div className="mb-4 flex items-center justify-between rounded-lg bg-primary/5 border border-primary/15 px-4 py-3" style={{ transition: 'background 0.2s' }}>
                                    <span className="text-sm font-medium text-foreground">Total à payer</span>
                                    <span className="text-lg font-black text-primary">
                                        {displayPrice.toLocaleString('fr-MA')} {plan.currency || 'MAD'}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing || !selectedProvider}
                                    className="submit-btn flex w-full items-center justify-center space-x-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-academic-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                                            <span>Redirection en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="LockClosedIcon" size={18} />
                                            <span>Payer {displayPrice.toFixed(2)} {plan.currency || 'MAD'} →</span>
                                        </>
                                    )}
                                </button>

                                <p className="mt-3 flex items-center justify-center space-x-1 text-center text-[11px] text-muted-foreground">
                                    <Icon name="LockClosedIcon" size={12} />
                                    <span>Vos données sont sécurisées et cryptées. Nous ne stockons jamais vos informations bancaires.</span>
                                </p>
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

                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ──────────────────────────────────────────
// Helper: PaymentOption button
// ──────────────────────────────────────────
function PaymentOption({
    id,
    title,
    subtitle,
    icon,
    imgSrc,
    color,
    selected,
    onClick,
    recommended,
}: {
    id: string;
    title: string;
    subtitle: string;
    icon?: React.ReactNode;
    imgSrc?: string;
    color?: string;
    selected: boolean;
    onClick: () => void;
    recommended?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`payment-option-btn relative w-full flex items-center justify-between rounded-xl border-2 p-3 text-left ${selected
                ? 'border-primary bg-primary/5 shadow-sm selected'
                : 'border-border bg-background hover:border-primary/50 hover:bg-muted/30'
                }`}
        >
            <div className="flex items-center space-x-3">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color || 'bg-muted'}`}
                    style={{ transition: 'transform 0.2s' }}
                >
                    {imgSrc ? (
                        <img src={imgSrc} alt={title} className="h-8 w-8 rounded object-contain" />
                    ) : (
                        <div className="text-white">{icon}</div>
                    )}
                </div>
                <div>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-foreground">{title}</p>
                        {recommended && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Recommandé</span>
                        )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
                </div>
            </div>
            <div style={{ transition: 'opacity 0.2s, transform 0.2s', opacity: selected ? 1 : 0, transform: selected ? 'scale(1)' : 'scale(0.5)' }}>
                <Icon name="CheckCircleIcon" size={22} className="shrink-0 text-primary" />
            </div>
        </button>
    );
}