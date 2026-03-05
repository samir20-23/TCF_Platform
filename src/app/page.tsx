import type { Metadata } from 'next';
import PublicHeader from '@/components/common/PublicHeader';
import HeroSection from './landing-page/components/HeroSection';
import BenefitsSection from './landing-page/components/BenefitsSection';
import HowItWorksSection from './landing-page/components/HowItWorksSection';
import TestimonialsSection from './landing-page/components/TestimonialsSection';
import { TESTIMONIALS } from '@/lib/testimonialsData';
import LandingPricingPreview from './landing-page/components/LandingPricingPreview';
import FAQSection from './landing-page/components/FAQSection';
import CTASection from './landing-page/components/CTASection';
import SiteFooter from '@/components/common/SiteFooter';

export const metadata: Metadata = {
  title: "TCF Canada — Préparation complète au TCF",
  description: "Préparez-vous au TCF Canada avec des simulations d'examen chronométrées, corrections personnalisées et suivi en ligne. Maximisez vos chances pour l'immigration au Canada.",
  openGraph: {
    title: "TCF Canada — Préparation complète au TCF",
    description: "Simulations chronométrées, corrections professionnelles et suivi personnalisé pour réussir votre TCF Canada.",
    type: 'website',
    locale: 'fr_CA',
  },
};

export default function RootPage() {
  const benefits = [
    {
      id: 1,
      icon: 'AcademicCapIcon',
      title: 'Préparation TCF complète',
      description: 'Tests couvrant toutes les épreuves : compréhension et expression, orale et écrite.',
    },
    {
      id: 2,
      icon: 'SpeakerWaveIcon',
      title: 'Exercices d\'écoute réalistes',
      description: 'Fichiers audio authentiques et questions calibrées pour entraîner votre compréhension orale.',
    },
    {
      id: 3,
      icon: 'DocumentTextIcon',
      title: 'Simulations chronométrées',
      description: 'Tests en conditions d\'examen réelles pour gérer votre temps efficacement.',
    },
    {
      id: 4,
      icon: 'ChartBarIcon',
      title: 'Suivi de performance',
      description: 'Tableau de bord avec scores, tendances et points à améliorer après chaque test.',
    },
    {
      id: 5,
      icon: 'ClockIcon',
      title: 'Accès flexible 24/7',
      description: 'Révisez à votre rythme depuis n\'importe quel appareil, quand vous voulez.',
    },
    {
      id: 6,
      icon: 'CheckBadgeIcon',
      title: 'Corrections professionnelles',
      description: 'Corrections manuelles pour l\'écriture et l\'expression orale par notre équipe certifiée.',
    },
  ];

  const steps = [
    { id: 1, title: "Choisissez un plan", text: "Sélectionnez le plan qui correspond à votre objectif et durée de préparation." },
    { id: 2, title: "Accès immédiat", text: "Nous créons automatiquement votre compte et vous donnons accès aux modules." },
    { id: 3, title: "Passez des simulations", text: "Entraînez-vous avec des tests chronométrés et comparez vos scores." },
    { id: 4, title: "Recevez des corrections", text: "Productions écrites corrigées et retours oraux pour progresser rapidement." },
  ];

  const testimonials = TESTIMONIALS;

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen">
        <HeroSection
          title="Réussissez votre TCF Canada"
          subtitle="Simulations d'examen réelles, entraînements chronométrés et corrections personnalisées pour maximiser vos résultats."
          ctaText="Commencer ma préparation"
          ctaLink="/user-registration"
        />
        <BenefitsSection benefits={benefits} />
        <HowItWorksSection steps={steps} />
        <TestimonialsSection testimonials={testimonials} />
        <LandingPricingPreview />
        <FAQSection />
        <CTASection
          title="Prêt à garantir votre succès ?"
          description="Inscrivez-vous maintenant et accédez instantanément à nos outils de préparation et corrections professionnelles."
          primaryCtaText="Créer mon compte"
          primaryCtaLink="/user-registration"
          secondaryCtaText="Voir nos plans"
          secondaryCtaLink="/pricing-plans"
        />
      </main>
      <SiteFooter />
    </>
  );
}