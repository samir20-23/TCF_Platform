'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import PricingCard from './PricingCard';
import ComparisonTable from './ComparisonTable';
import TrustSignals from './TrustSignals';
import TestimonialCard from './TestimonialCard';
import FAQSection from './FAQSection';
import PaymentModal from './PaymentModal';
import SuccessModal from './SuccessModal'; 
import toast from 'react-hot-toast';
import PlanCards from './planCards';

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

interface ComparisonFeature {
  category: string;
  features: {
    name: string;
    basic: boolean | string;
    premium: boolean | string;
    vip: boolean | string;
  }[];
}

const PricingInteractive = () => {
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

  const comparisonData: ComparisonFeature[] = [
    {
      category: 'Contenu et Stratégie',
      features: [
        { name: 'Compréhension orale', basic: true, premium: true, vip: true },
        { name: 'Compréhension écrite', basic: true, premium: true, vip: true },
        { name: 'Expression écrite', basic: 'Fondamentaux', premium: true, vip: true },
        { name: 'Expression orale', basic: 'Techniques', premium: 'Pratique', vip: 'Intensif' },
        { name: 'Stratégies d\'examen', basic: true, premium: true, vip: true }
      ]
    },
    {
      category: 'Entraînement',
      features: [
        { name: 'Exercices de pratique', basic: 'Essentiels', premium: 'Complets', vip: 'Illimités' },
        { name: 'Simulations d\'examen', basic: '1 simulation', premium: '5 simulations', vip: 'Illimitées' },
        { name: 'Corrections automatiques', basic: true, premium: true, vip: true },
        { name: 'Chronométrage réel', basic: true, premium: true, vip: true }
      ]
    },
    {
      category: 'Ressources',
      features: [
        { name: 'Vidéos explicatives', basic: 'Fondamentales', premium: 'Toutes les vidéos', vip: 'Accès exclusif' },
        { name: 'PDF stratégiques', basic: false, premium: true, vip: true },
        { name: 'Fiches de révision', basic: false, premium: true, vip: true },
        { name: 'Mises à jour incluses', basic: true, premium: true, vip: true }
      ]
    },
    {
      category: 'Support et Accès',
      features: [
        { name: 'Support par email', basic: 'Standard', premium: 'Prioritaire', vip: '24/7 dédié' },
        { name: 'Durée d\'accès', basic: '30 jours', premium: '60 jours', vip: '90 jours' },
        { name: 'Suivi de progression', basic: true, premium: true, vip: true },
        { name: 'Coaching stratégique', basic: false, premium: false, vip: true }
      ]
    }
  ];

  const trustSignals = [
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
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Immigrante au Canada',
      image: "",
      alt: 'Marie Dubois',
      rating: 5,
      text: 'Le plan Premium a été déterminant pour mon succès. Les simulations m\'ont permis d\'aborder l\'examen sans aucun stress.',
      plan: 'Premium'
    },
    {
      name: 'Ahmed Benali',
      role: 'Candidat à l\'immigration',
      image: "",
      alt: 'Ahmed Benali',
      rating: 5,
      text: 'L\'accès VIP illimité est un vrai plus. J\'ai pu refaire les tests autant de fois que nécessaire pour atteindre mon score cible.',
      plan: 'VIP'
    },
    {
      name: 'Sophie Martin',
      role: 'Professionnelle',
      image: "",
      alt: 'Sophie Martin',
      rating: 5,
      text: 'Le plan Basique offre déjà tout l\'essentiel pour comprendre la structure du TCF. C\'est parfait pour commencer sérieusement sa préparation.',
      plan: 'Basique'
    }
  ];

  const faqs = [
    {
      question: 'Quels sont les plans d\'abonnement disponibles ?',
      answer: 'Nous proposons trois plans exclusifs : Basique (essentiels), Premium (complet avec simulations) et VIP (accès illimité avec coaching).'
    },
    {
      question: 'Puis-je changer de plan après mon achat ?',
      answer: 'Oui, vous pouvez passer à un niveau supérieur à tout moment depuis votre tableau de bord pour accéder à plus d\'outils de préparation.'
    },
    {
      question: 'Quelle est la durée d\'accès pour chaque plan ?',
      answer: 'Le plan Basique offre 30 jours d\'accès, le Premium 60 jours, et le plan VIP vous offre 90 jours d\'accès complet.'
    },
    {
      question: 'Les quatre épreuves du TCF sont-elles couvertes ?',
      answer: 'Absolument. Tous nos plans incluent la préparation complète (Compréhension Orale/Écrite et Expression Orale/Écrite) adaptée au TCF Canada.'
    },
    {
      question: 'Le paiement est-il sécurisé ?',
      answer: 'Oui, nous utilisons Stripe et PayPal pour garantir la sécurité totale de vos transactions. Vos données bancaires ne sont jamais stockées sur nos serveurs.'
    }
  ];

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-3/4 rounded bg-muted"></div>
            <div className="grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-lg bg-muted"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectPlan = (planName: string, price: number) => {
    if (!isHydrated) return;

    if (!user) {
      window.location.href = `/user-registration`;
      return;
    }

    const plan = plans.find(p => p.planName === planName);
    if (!plan) return;

    setSelectedPlanId(plan.id);
    setSelectedPlanName(planName);
    setSelectedPrice(price);
    setSelectedCurrency(plan.currency);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (provider: 'stripe' | 'paypal') => {
    if (!user || !selectedPlanId) return;

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

      <PlanCards />

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold text-foreground">
              Comparaison détaillée des plans
            </h2>
            <p className="text-muted-foreground">
              Découvrez en détail ce qui est inclus dans chaque plan
            </p>
          </div>
          <ComparisonTable comparisonData={comparisonData} />
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold text-foreground">
              Ce que disent nos étudiants
            </h2>
            <p className="text-muted-foreground">
              Des milliers d&apos;étudiants ont réussi leur TCF Canada avec nous
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold text-foreground">
              Questions fréquentes
            </h2>
          </div>
          <FAQSection faqs={faqs} />
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="mb-4 font-heading text-3xl font-bold">
            Prêt à commencer votre préparation ?
          </h2>
          <button
            onClick={() => {
              const premiumPlan = plans.find((p) => p.planName === 'Premium');
              if (premiumPlan) {
                handleSelectPlan(premiumPlan.planName, premiumPlan.price);
              }
            }}
            className="inline-flex items-center space-x-2 rounded-md bg-accent px-8 py-4 font-caption text-sm font-medium text-accent-foreground shadow-academic-lg transition-academic hover:-translate-y-0.5 hover:shadow-academic-xl"
          >
            <span>Commencer maintenant</span>
          </button>
        </div>
      </section>

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

export default PricingInteractive;