'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const HeroSection = ({ title, subtitle, ctaText, ctaLink }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-academic-light min-h-[85vh] flex items-center">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative section-container w-full py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          {/* Tag line */}
          <div className="inline-flex items-center gap-2 rounded-md bg-white border border-border px-4 py-1.5 text-sm font-medium text-foreground mb-8 shadow-sm">
            <Icon name="AcademicCapIcon" size={16} className="text-primary" />
            <span>La plateforme #1 de préparation au TCF Canada</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-heading">
            {title.split(' ').map((word, i) => (
              <span key={i}>
                {i === title.split(' ').length - 1 ? (
                  <span className="text-primary">{word}</span>
                ) : (
                  word + ' '
                )}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaLink}
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto"
            >
              {ctaText}
            </Link>
            <Link
              href="/pricing-plans"
              className="btn-outline text-base px-8 py-3.5 w-full sm:w-auto"
            >
              Voir les plans
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-12 pt-8 border-t border-border/40">
            <TrustItem icon="UsersIcon" value="500+" label="Étudiants" />
            <TrustItem icon="StarIcon" value="4.8/5" label="Satisfaction" />
            <TrustItem icon="ShieldCheckIcon" value="100%" label="Sécurisé" />
            <TrustItem icon="ClockIcon" value="24/7" label="Accessibilité" />
          </div>
        </div>
      </div>
    </section>
  );
};

function TrustItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon name={icon as any} size={18} className="text-primary" />
      <span className="text-sm">
        <strong className="text-foreground font-semibold">{value}</strong>{' '}
        <span className="text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

export default HeroSection;
