import type { Metadata } from 'next';
import PublicHeader from '@/components/common/PublicHeader';
import HeroSection from './components/HeroSection';
import BenefitsSection from './components/BenefitsSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialsSection from './components/TestimonialsSection';
import LandingPricingPreview from './components/LandingPricingPreview';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import SiteFooter from '@/components/common/SiteFooter';

export const metadata: Metadata = {
  title: "Accueil — TCF Canada",
  description: "Préparez-vous au TCF Canada avec simulations chronométrées, corrections professionnelles et suivi personnalisé.",
};

export default function LandingPage() {
  const hero = {
    title: "Réussissez votre TCF Canada",
    subtitle: "Simulations chronométrées, corrections professionnelles et suivi personnalisé pour maximiser vos résultats",
    ctaText: "Commencer ma préparation",
    ctaLink: "/user-registration",
  };

  const benefits = [
    { id: 1, icon: 'AcademicCapIcon', title: 'Préparation TCF complète', description: 'Exercices et tests couvrant toutes les épreuves : compréhension orale, compréhension écrite, expression orale et expression écrite.' },
    { id: 2, icon: 'VideoCameraIcon', title: 'Simulations réelles chronométrées', description: "Tests complets en conditions d'examen pour s'habituer au format et à la gestion du temps." },
    { id: 3, icon: 'DocumentTextIcon', title: 'Corrections professionnelles', description: 'Productions écrites corrigées et feedback oral pour améliorer vos points faibles.' },
    { id: 4, icon: 'ChartBarIcon', title: 'Ressources stratégiques', description: 'Vidéos, fiches méthodologiques et exemples corrigés alignés sur la version 2026 du TCF Canada.' },
    { id: 5, icon: 'ClockIcon', title: 'Accès 24/7', description: 'Plateforme accessible sur mobile et desktop pour réviser à votre rythme, à toute heure.' },
    { id: 6, icon: 'CheckBadgeIcon', title: 'Suivi de progression', description: "Tableaux de bord et historique de vos scores pour suivre l'évolution et cibler vos révisions." },
  ];

  const steps = [
    { id: 1, title: "Choisissez un plan", text: "Sélectionnez le plan qui correspond à votre objectif et durée de préparation." },
    { id: 2, title: "Accès immédiat", text: "Nous créons automatiquement votre compte et vous donnez accès aux modules." },
    { id: 3, title: "Passez des simulations", text: "Entraînez-vous avec des tests chronométrés et comparez vos scores." },
    { id: 4, title: "Recevez des corrections", text: "Productions écrites corrigées et retours oraux pour progresser rapidement." },
  ];

  const testimonials = [
    { id: 1, name: 'Sophie Tremblay', role: 'Abonnée Premium', quote: "Les simulations m'ont plongée dans les vraies conditions d'examen. Ma gestion du temps et mes scores se sont nettement améliorés.", achievement: 'Score TCF : 520 / 699', rating: 5 },
    { id: 2, name: 'Marc Dubois', role: 'Abonné VIP', quote: "Les corrections détaillées et le suivi personnalisé ont transformé mon expression écrite.", achievement: 'Score TCF : 485 / 699', rating: 5 },
    { id: 3, name: 'Fatima El Amrani', role: 'Abonnée Essentiel', quote: "Le plan Essentiel m'a permis de structurer mes révisions avec des tests ciblés et retours clairs.", achievement: 'Score TCF : 498 / 699', rating: 5 },
    { id: 4, name: 'Abdelkader Bouzayani', role: 'Ancien candidat', quote: "L'encadrement et les séries d'examens réels m'ont permis d'obtenir un excellent résultat le jour J.", achievement: 'Score TCF : 547 / 699', rating: 5 },
  ];

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen">
        <HeroSection title={hero.title} subtitle={hero.subtitle} ctaText={hero.ctaText} ctaLink={hero.ctaLink} />
        <BenefitsSection benefits={benefits} />
        <HowItWorksSection steps={steps} />
        <TestimonialsSection testimonials={testimonials} />
        <LandingPricingPreview />
        <FAQSection />
        <CTASection
          title="Prêt à garantir votre succès ?"
          description="Inscrivez-vous maintenant et accédez instantanément à nos outils et corrections professionnelles."
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