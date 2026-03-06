'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PricingCard from './PricingCard';
import TrustSignals from './TrustSignals';
import PaymentModal from './PaymentModal';
import SuccessModal from './SuccessModal';
import toast from 'react-hot-toast';

interface PricingPlan {
  id: string;
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  description: string;
  isRecommended?: boolean;
  isPopular?: boolean;
}

const PlanCards = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPlanName, setSelectedPlanName] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('MAD');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();

      if (data.plans) {
        const transformedPlans: PricingPlan[] = data.plans.map((plan: any) => ({
          id: plan.id,
          planName: plan.name,
          price: (plan.price_cents || 0) / 100,
          currency: plan.currency || 'MAD',
          billingPeriod: (plan.duration_days || 30) + ' jours d\'accès',
          description: plan.description || '',
          isRecommended: plan.is_popular,
          isPopular: plan.is_popular
        }));
        setPlans(transformedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-3/4 rounded bg-muted"></div>
            <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-lg bg-muted shadow-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectPlan = (planName: string, price: number) => {
    if (!isHydrated) return;

    const plan = plans.find(p => p.planName === planName);
    if (!plan) return;

    if (!user) {
      // No account yet → go to checkout page (register + pay in one flow)
      window.location.href = `/checkout/${plan.id}`;
      return;
    }

    // Already logged in → use existing payment modal
    setSelectedPlanId(plan.id);
    setSelectedPlanName(planName);
    setSelectedPrice(price);
    setSelectedCurrency(plan.currency);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (provider: any) => {
    if (!user || !selectedPlanId) return;

    // Non-digital providers: show contact message
    if (provider !== 'stripe' && provider !== 'paypal') {
      toast.success(`Veuillez nous contacter à support@tcfcanada....com pour finaliser votre paiement via ${provider}.`, { duration: 8000 });
      setIsPaymentModalOpen(false);
      return;
    }

    setIsProcessing(true);

    try {
      const endpoint = provider === 'stripe'
        ? '/api/payments/stripe/create-session'
        : '/api/payments/paypal/create-order';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanId,
          successUrl: `${window.location.origin}/student-dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing-plans?checkout=canceled`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error && data.error.toLowerCase().includes('not configured')) {
          toast.error('Ce mode de paiement est indisponible pour le moment.');
          return;
        }
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de redirection manquante');
      }
    } catch (error: any) {
      console.error('Error starting checkout:', error);
      toast.error(error.message || 'Une erreur est survenue lors du démarrage du paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <section className="bg-[#f4f7f9] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-[#0f172a]">
              Choisissez votre plan de préparation
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#64748b]">
              Investissez dans votre réussite au TCF Canada avec nos plans adaptés à tous les besoins et budgets
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 justify-items-center" >
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className="w-full min-w-[320px] max-w-sm mx-auto transform transition duration-300 ease-out    rounded-lg"
                style={{
                  animationName: 'fadeInUp',
                  animationDuration: '420ms',
                  animationTimingFunction: 'cubic-bezier(.2,.9,.2,1)',
                  animationFillMode: 'both',
                  animationDelay: `${i * 80}ms`
                }}
              >
                <PricingCard
                  {...plan}
                  onPurchase={handleSelectPlan}
                  isProcessing={isProcessing}
                />
              </div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="mt-6">
            <TrustSignals
              signals={[
                {
                  icon: 'ShieldCheckIcon',
                  title: 'Paiement sécurisé',
                  description: 'Transactions protégées par Stripe & PayPal avec cryptage SSL'
                },
                {
                  icon: 'ArrowPathIcon',
                  title: 'Satisfaction garantie',
                  description: 'Notre contenu est mis à jour régulièrement selon les standards officiels'
                },
                {
                  icon: 'AcademicCapIcon',
                  title: 'Expertise TCF',
                  description: 'Une méthode conçue par des spécialistes de l\'enseignement du français'
                }
              ]}
            />
          </div>
        </div>

        {/* Subtle entrance animation keyframes */}
        <style>
          {`
      @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(10px) scale(.995); }
        60% { opacity: 1; transform: translateY(-4px) scale(1.005); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .transform, .transition { animation: none !important; transition: none !important; }
      }
    `}
        </style>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        planName={selectedPlanName}
        price={selectedPrice}
        currency={selectedCurrency}
        isProcessing={isProcessing}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPlanId('');
          setSelectedPlanName('');
          setSelectedPrice(0);
        }}
        onConfirm={handlePaymentConfirm}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        planName={selectedPlanName}
        onClose={() => {
          setIsSuccessModalOpen(false);
          window.location.href = '/student-dashboard';
        }}
      />
    </>
  );
};

export default PlanCards;
