'use client';

import { useState } from 'react';
import PublicHeader from '@/components/common/PublicHeader';
import Footer from '@/app/landing-page/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return; // Request cancelled
      }
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Contactez-nous
            </h1>
            <p className="text-lg text-muted-foreground">
              Une question ? Une suggestion ? Nous sommes là pour vous aider.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 font-heading text-2xl font-semibold text-foreground">
                Informations de contact
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Icon name="EnvelopeIcon" size={24} className="mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <a href="mailto:support@tcfcanada....com" className="text-muted-foreground hover:text-primary">
                      support@tcfcanada....com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Icon name="PhoneIcon" size={24} className="mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Téléphone</h3>
                    <a href="tel:+15141234567" className="text-muted-foreground hover:text-primary">
                      +1 (514....-4567
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Icon name="ClockIcon" size={24} className="mt-1 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Heures d'ouverture</h3>
                    <p className="text-muted-foreground">
                      Lundi - Vendredi: 9h00 - 18h00<br />
                      Samedi: 10h00 - 16h00<br />
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-border bg-card px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-border bg-card px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-md border border-border bg-card px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-md border border-border bg-card px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {submitStatus && (
                  <div
                    className={`rounded-md p-4 ${submitStatus.type === 'success'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                      }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer sections={footerSections} socialLinks={socialLinks} />
    </>
  );
}
