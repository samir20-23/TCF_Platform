'use client';

import PublicHeader from '@/components/common/PublicHeader';
import Footer from '@/app/landing-page/components/Footer';

export default function PrivacyPolicyPage() {
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
          <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">
            Politique de confidentialité
          </h1>

          <div className="prose prose-slate max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Introduction
              </h2>
              <p>
                TCF Canada s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Informations que nous collectons
              </h2>
              <p>Nous collectons les informations suivantes :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Nom, prénom et adresse email</li>
                <li>Informations de compte et préférences</li>
                <li>Données de progression et résultats d'exercices</li>
                <li>Informations de paiement (traitées de manière sécurisée)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Utilisation des informations
              </h2>
              <p>Nous utilisons vos informations pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience d'apprentissage</li>
                <li>Traiter vos paiements</li>
                <li>Vous contacter concernant votre compte</li>
                <li>Envoyer des communications importantes (non marketing)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Protection des données
              </h2>
              <p>
                Nous utilisons des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte ou destruction.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Vos droits
              </h2>
              <p>Vous avez le droit de :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Accéder à vos données personnelles</li>
                <li>Corriger des informations inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Contact
              </h2>
              <p>
                Pour toute question concernant cette politique de confidentialité, contactez-nous à :{' '}
                <a href="mailto:privacy@tcfcanadaprep.com" className="text-primary hover:underline">
                  privacy@tcfcanadaprep.com
                </a>
              </p>
            </section>

            <section>
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer sections={footerSections} socialLinks={socialLinks} />
    </>
  );
}
