'use client';

import { useState } from 'react';
import PublicHeader from '@/components/common/PublicHeader';
import Footer from '@/app/landing-page/components/Footer';
import Icon from '@/components/ui/AppIcon';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Qu\'est-ce que le TCF Canada ?',
      answer: 'Le TCF (Test de Connaissance du Français) Canada est un test de français standardisé requis pour l\'immigration au Canada. Il évalue vos compétences en compréhension orale, compréhension écrite, expression écrite et expression orale.',
    },
    {
      question: 'Quel score dois-je obtenir pour l\'immigration ?',
      answer: 'Les scores requis varient selon le programme d\'immigration. Généralement, vous devez obtenir au moins le niveau B2 dans chaque compétence. Consultez le site d\'Immigration, Réfugiés et Citoyenneté Canada (IRCC) pour les exigences spécifiques à votre situation.',
    },
    {
      question: 'Combien de temps dure la préparation ?',
      answer: 'La durée de préparation dépend de votre niveau actuel et de votre objectif. En moyenne, nos étudiants se préparent pendant 2 à 6 mois avec un engagement régulier de 5 à 10 heures par semaine.',
    },
    {
      question: 'Les cours sont-ils adaptés à mon niveau ?',
      answer: 'Oui, nos cours sont structurés pour tous les niveaux, du débutant à l\'avancé. Vous pouvez commencer par une évaluation de votre niveau et suivre un parcours personnalisé.',
    },
    {
      question: 'Puis-je accéder aux cours sur mobile ?',
      answer: 'Oui, notre plateforme est entièrement responsive et fonctionne sur tous les appareils : ordinateurs, tablettes et smartphones.',
    },
    {
      question: 'Que se passe-t-il si je ne suis pas satisfait ?',
      answer: 'Nous offrons une garantie de satisfaction. Si vous n\'êtes pas satisfait dans les 30 premiers jours, contactez-nous pour un remboursement complet.',
    },
    {
      question: 'Les instructeurs corrigent-ils mes travaux ?',
      answer: 'Oui, pour les plans Premium et VIP, vos travaux d\'expression écrite et orale sont corrigés par nos instructeurs qualifiés avec des commentaires détaillés.',
    },
    {
      question: 'Combien de temps les résultats du TCF sont-ils valides ?',
      answer: 'Les résultats du TCF Canada sont valides pendant 2 ans à compter de la date de l\'examen.',
    },
  ];

  const footerSections = [
    {
      title: 'Plateforme',
      links: [
        { label: 'Tarifs', href: '/pricing-plans' },
        { label: 'Témoignages', href: '/landing-page#testimonials' },
      ],
    },
    {
      title: 'Compte',
      links: [
        { label: 'Connexion', href: '/user-login' },
        { label: 'Inscription', href: '/user-registration' },
        { label: 'Mon profil', href: '/user-profile' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Contact', href: '/contact' },
        { label: 'Guide TCF', href: '/tcf-guide' },
      ],
    },
  ];

  const socialLinks = {
    facebook: 'https://facebook.com/tcfcanadaprep',
    twitter: 'https://twitter.com/tcfcanadaprep',
    linkedin: 'https://linkedin.com/company/tcfcanadaprep',
    instagram: 'https://instagram.com/tcfcanadaprep',
  };

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-heading text-4xl font-bold text-foreground">
              Questions fréquemment posées
            </h1>
            <p className="text-lg text-muted-foreground">
              Trouvez des réponses aux questions les plus courantes sur notre plateforme et le TCF Canada.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card shadow-academic"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <Icon
                    name={openIndex === index ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                    size={24}
                    className="text-muted-foreground"
                  />
                </button>
                {openIndex === index && (
                  <div className="border-t border-border p-6 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-muted p-8 text-center">
            <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
              Vous avez d'autres questions ?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center space-x-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span>Nous contacter</span>
              <Icon name="ArrowRightIcon" size={20} />
            </a>
          </div>
        </div>
      </main>
      <Footer sections={footerSections} socialLinks={socialLinks} />
    </>
  );
}
