'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PublicHeader from '@/components/common/PublicHeader';
import Icon from '@/components/ui/AppIcon';

function SuccessContent() {
    const searchParams = useSearchParams();
    const planName = searchParams.get('plan') || '';
    const sessionId = searchParams.get('session_id');
    const [activationStatus, setActivationStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading');

    useEffect(() => {
        if (!sessionId) {
            setActivationStatus('success');
            return;
        }

        const verifyAndActivate = async () => {
            try {
                const res = await fetch('/api/payments/verify-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                });
                const data = await res.json();

                if (res.ok) {
                    setActivationStatus(data.alreadyProcessed ? 'already' : 'success');
                } else {
                    console.error('Verify session error:', data.error);
                    setActivationStatus('error');
                }
            } catch (err) {
                console.error('Verify session network error:', err);
                setActivationStatus('error');
            }
        };

        verifyAndActivate();
    }, [sessionId]);

    return (
        <div className="w-full max-w-lg text-center">
            <div className="mb-8 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-academic-lg">
                    <Icon name="CheckCircleIcon" size={56} className="text-green-600" />
                </div>
            </div>

            <h1 className="mb-4 font-heading text-3xl font-bold text-foreground">
                🎉 Paiement réussi !
            </h1>

            {planName && (
                <p className="mb-2 text-lg font-medium text-primary">
                    Plan {decodeURIComponent(planName)} activé
                </p>
            )}

            {/* Activation status */}
            <div className="my-4">
                {activationStatus === 'loading' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        Activation de votre abonnement...
                    </div>
                )}
                {activationStatus === 'success' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-bold">
                        <Icon name="CheckCircleIcon" size={16} />
                        Abonnement activé avec succès ! Vos tests sont prêts.
                    </div>
                )}
                {activationStatus === 'already' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-bold">
                        <Icon name="CheckCircleIcon" size={16} />
                        Abonnement déjà actif.
                    </div>
                )}
                {activationStatus === 'error' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-600 font-medium">
                        <Icon name="ExclamationTriangleIcon" size={16} />
                        L'activation automatique a échoué. Contactez le support si vos tests n'apparaissent pas.
                    </div>
                )}
            </div>

            {/* Email verification notice */}
            <div className="my-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-left">
                <div className="flex items-start space-x-4">
                    <div className="shrink-0 rounded-full bg-blue-100 p-2">
                        <Icon name="EnvelopeIcon" size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="mb-2 font-heading text-lg font-semibold text-blue-900">
                            Vérifiez votre boîte e-mail
                        </h2>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Nous vous avons envoyé un e-mail de confirmation. Vérifiez votre dossier de courriers indésirables (spam) si vous ne le voyez pas dans votre boîte de réception.
                            <br /><br />
                            <strong>Cliquez sur le lien de vérification</strong> dans cet e-mail pour activer votre compte, puis connectez-vous pour accéder à votre tableau de bord.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <Link
                    href="/user-login"
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-academic-lg transition-all hover:shadow-academic-xl hover:-translate-y-0.5"
                >
                    <Icon name="ArrowRightOnRectangleIcon" size={20} />
                    <span>Se connecter maintenant</span>
                </Link>
            </div>

            <div className="mt-10 rounded-xl bg-muted/50 p-6 text-left">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Prochaines étapes</p>
                <div className="space-y-3">
                    {[
                        { step: '1', text: 'Vérifiez votre boîte de réception', done: true },
                        { step: '2', text: 'Cliquez sur le lien de confirmation' },
                        { step: '3', text: 'Connectez-vous avec votre e-mail et mot de passe' },
                        { step: '4', text: 'Accédez à votre tableau de bord et commencez à pratiquer !' },
                    ].map(({ step, text, done }) => (
                        <div key={step} className="flex items-center space-x-3">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {done ? <Icon name="CheckIcon" size={14} /> : step}
                            </div>
                            <span className="text-sm text-foreground">{text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-background">
            <PublicHeader />
            <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
                <Suspense fallback={<div className="animate-pulse text-muted-foreground">Chargement...</div>}>
                    <SuccessContent />
                </Suspense>
            </main>
        </div>
    );
}
