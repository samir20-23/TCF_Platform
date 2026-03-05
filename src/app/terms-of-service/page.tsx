'use client';

import PublicHeader from '@/components/common/PublicHeader';
import Footer from '@/app/landing-page/components/Footer';

export default function TermsOfServicePage() {
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
            Conditions d'utilisation
          </h1>

          <div className="prose prose-slate max-w-none space-y-8 text-muted-foreground">
            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Acceptation des conditions
              </h2>
              <p>
                En accédant et en utilisant TCF Canada, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Utilisation du service
              </h2>
              <p>Vous vous engagez à :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Utiliser le service uniquement à des fins légales</li>
                <li>Ne pas partager votre compte avec d'autres personnes</li>
                <li>Ne pas tenter d'accéder à des zones non autorisées</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas utiliser le service pour des activités frauduleuses</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Comptes utilisateurs
              </h2>
              <p>
                Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe. Vous acceptez de nous notifier immédiatement de toute utilisation non autorisée de votre compte.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Propriété intellectuelle
              </h2>
              <p>
                Tout le contenu de la plateforme, y compris les cours, vidéos, exercices et matériels pédagogiques, est la propriété de TCF Canada et est protégé par les lois sur la propriété intellectuelle. Vous n'êtes pas autorisé à reproduire, distribuer ou utiliser ce contenu à des fins commerciales sans autorisation écrite.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Paiements et remboursements
              </h2>
              <p>
                Les paiements sont traités de manière sécurisée. Nous offrons une garantie de remboursement de 30 jours si vous n'êtes pas satisfait de nos services. Contactez-nous pour toute demande de remboursement.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Limitation de responsabilité
              </h2>
              <p>
                TCF Canada ne garantit pas que l'utilisation de notre service garantira la réussite au TCF Canada. Nous fournissons des outils et ressources pour vous aider dans votre préparation, mais les résultats dépendent de nombreux facteurs, notamment votre engagement et votre niveau initial.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Modifications des conditions
              </h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication sur cette page.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Contact
              </h2>
              <p>
                Pour toute question concernant ces conditions d'utilisation, contactez-nous à :{' '}
                <a href="mailto:legal@tcfcanadaprep.com" className="text-primary hover:underline">
                  legal@tcfcanadaprep.com
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
