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
  // Brand colors: Gold, Blue, and a touch of Red
  const balls = [
    { color: '#135df2ff', i: '20px', d: '6s' },
    { color: '#c4a57492', i: '40px', d: '10s' },
    { color: '#dc143c87', i: '10px', d: '8s' }, // The "little" red
    { color: '#135df276', i: '60px', d: '14s' },
    { color: '#c4a574c8', i: '30px', d: '11s' },
  ];

  return (
    <section className="relative overflow-hidden bg-academic-light min-h-[85vh] flex items-center">

      {/* --- ANIMATED BACKGROUND CLUSTERS --- */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Top Left Cluster */}
        <div className="absolute -top-20 -left-20   scale-125 sm:scale-150" style={{ opacity: "0.1" }}>
          <div className="container-loader">
            {balls.map((ball, idx) => (
              <div
                key={`tl-${idx}`}
                className="ball"
                style={{
                  // @ts-ignore
                  '--color': ball.color,
                  '--i': ball.i,
                  '--d': ball.d,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Bottom Right Cluster */}
        <div className="absolute -bottom-20 -right-20  scale-125 sm:scale-150" style={{ opacity: "0.1" }}>
          <div className="container-loader">
            {balls.map((ball, idx) => (
              <div
                key={`br-${idx}`}
                className="ball"
                style={{
                  // @ts-ignore
                  '--color': ball.color,
                  '--i': ball.i,
                  '--d': ball.d,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subtle Grid overlay for that premium academic feel */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* --- CONTENT --- */}
      <div className="relative z-10 section-container w-full py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">

          {/* Tag line */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-border px-4 py-1.5 text-sm font-medium text-foreground mb-8 shadow-sm">
            <Icon name="AcademicCapIcon" size={16} className="text-[#135ef2]" />
            <span>La plateforme #1 de préparation au TCF Canada</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 font-heading">
            {title.split(' ').map((word, i) => (
              <span key={i}>
                {i === title.split(' ').length - 1 ? (
                  <span className="text-[#135ef2]">{word}</span>
                ) : (
                  word + ' '
                )}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaLink}
              className="bg-[#135ef2] text-white hover:shadow-blue-500/40 transition-all text-base px-8 py-3.5 w-full sm:w-auto rounded-lg font-semibold shadow-lg shadow-blue-500/20"
            >
              {ctaText}
            </Link>
            <Link
              href="/pricing-plans"
              className="bg-white/60 backdrop-blur-md border border-border/50 hover:bg-white text-base px-8 py-3.5 w-full sm:w-auto rounded-lg font-semibold transition-all"
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

      <style jsx global>{`
        .container-loader {
          --size: 250px;
          width: var(--size);
          height: var(--size);
          position: relative;
        }

        .ball {
          position: absolute;
          width: calc(var(--size) + var(--i));
          height: calc(var(--size) + var(--i));
          background-color: var(--color);
          border-radius: 50%;
          animation: move linear infinite;
          transform-origin: center;
          mix-blend-mode: hard-light;
          animation-duration: var(--d);
          filter: blur(45px); /* Adjusted for better visibility */
          opacity: 0.9;
          left: 50%;
          top: 50%;
          margin-left: calc((var(--size) + var(--i)) / -2);
          margin-top: calc((var(--size) + var(--i)) / -2);
        }

        .ball:nth-child(even) {
          animation-direction: reverse;
        }

        @keyframes move {
          0% { transform: rotate(0deg) translate(30px) rotate(0deg); }
          100% { transform: rotate(360deg) translate(30px) rotate(-360deg); }
        }
      `}</style>
    </section>
  );
};

function TrustItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon name={icon as any} size={18} className="text-[#c4a574]" />
      <span className="text-sm">
        <strong className="text-foreground font-semibold">{value}</strong>{' '}
        <span className="text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

export default HeroSection;