'use client';

import PublicHeader from '@/components/common/PublicHeader';
import Footer from '@/app/landing-page/components/Footer';
import Icon from '@/components/ui/AppIcon';

export default function TCFGuidePage() {
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
          <div className="mb-12">
            <h1 className="mb-4 font-heading text-4xl font-bold text-foreground">
              Guide complet du TCF Canada
            </h1>
            <p className="text-lg text-muted-foreground">
              Tout ce que vous devez savoir pour réussir votre test de français pour l'immigration au Canada.
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Qu'est-ce que le TCF Canada ?
              </h2>
              <p className="mb-4 text-muted-foreground">
                Le Test de Connaissance du Français (TCF) Canada est un test de français standardisé conçu spécifiquement pour les candidats à l'immigration au Canada. Il évalue vos compétences en français dans quatre domaines essentiels.
              </p>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Les quatre compétences évaluées
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-6">
                  <Icon name="MicrophoneIcon" size={32} className="mb-4 text-primary" />
                  <h3 className="mb-2 font-semibold text-foreground">Compréhension orale</h3>
                  <p className="text-sm text-muted-foreground">
                    Écoutez des dialogues et des documents audio, puis répondez à des questions de compréhension.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Icon name="BookOpenIcon" size={32} className="mb-4 text-primary" />
                  <h3 className="mb-2 font-semibold text-foreground">Compréhension écrite</h3>
                  <p className="text-sm text-muted-foreground">
                    Lisez des textes variés et démontrez votre compréhension à travers des questions.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Icon name="PencilIcon" size={32} className="mb-4 text-primary" />
                  <h3 className="mb-2 font-semibold text-foreground">Expression écrite</h3>
                  <p className="text-sm text-muted-foreground">
                    Rédigez des textes structurés sur des sujets variés, démontrant votre maîtrise de l'écriture.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Icon name="ChatBubbleLeftRightIcon" size={32} className="mb-4 text-primary" />
                  <h3 className="mb-2 font-semibold text-foreground">Expression orale</h3>
                  <p className="text-sm text-muted-foreground">
                    Exprimez-vous oralement sur des sujets variés lors d'un entretien avec un examinateur.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Scores requis pour l'immigration
              </h2>
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="mb-4 text-muted-foreground">
                  Les scores requis varient selon le programme d'immigration :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Programme fédéral des travailleurs qualifiés :</strong> Niveau B2 minimum dans chaque compétence</li>
                  <li><strong className="text-foreground">Programme d'expérience québécoise :</strong> Niveau B2 minimum</li>
                  <li><strong className="text-foreground">Autres programmes :</strong> Consultez les exigences spécifiques sur le site d'IRCC</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Comment se préparer efficacement
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Évaluez votre niveau actuel</h3>
                    <p className="text-muted-foreground">
                      Commencez par identifier vos forces et faiblesses dans chaque compétence.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Suivez un programme structuré</h3>
                    <p className="text-muted-foreground">
                      Utilisez nos cours organisés par compétence pour progresser systématiquement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Pratiquez régulièrement</h3>
                    <p className="text-muted-foreground">
                      Consacrez au moins 5-10 heures par semaine à votre préparation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Faites des simulations</h3>
                    <p className="text-muted-foreground">
                      Testez-vous dans des conditions réelles avec nos examens pratiques.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-primary/10 p-8 text-center">
              <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
                Prêt à commencer votre préparation ?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Rejoignez des centaines d'étudiants qui ont réussi leur TCF Canada grâce à notre plateforme.
              </p>
              <a
                href="/user-registration"
                className="inline-flex items-center space-x-2 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span>Commencer maintenant</span>
                <Icon name="ArrowRightIcon" size={20} />
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer sections={footerSections} socialLinks={socialLinks} />
    </>
  );
}
