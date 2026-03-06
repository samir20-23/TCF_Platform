'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Benefit {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface BenefitsSectionProps {
  benefits: Benefit[];
}

const BenefitsSection = ({ benefits }: BenefitsSectionProps) => {
  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-center">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <p className="text-lg text-[#64748b] text-center max-w-2xl mx-auto">
            Une plateforme complète conçue pour maximiser vos chances de réussite au TCF Canada
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
          
          {/* Card 1 — Large Square (span 2x2 on lg) */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
            <BentoCard
              title="Simulations réalistes chronométrées"
              description="Tests complets en conditions d'examen pour s'habituer au format et à la gestion du temps."
              icon="ClockIcon"
              size="large"
              accent="bg-blue-50"
            >
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#0f172a]">
                  <div className="w-2 h-2 rounded-full bg-[#135ef2]"></div>
                  <span>Durée : 2h24 minutes</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#0f172a]">
                  <div className="w-2 h-2 rounded-full bg-[#135ef2]"></div>
                  <span>Format identique à l'examen</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#0f172a]">
                  <div className="w-2 h-2 rounded-full bg-[#135ef2]"></div>
                  <span>Accès illimité</span>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Card 2 — Tall Vertical (span 2x on lg) */}
          <div className="md:col-span-1 lg:col-span-1 lg:row-span-2">
            <BentoCard
              title="Suivi de progression"
              description="Tableaux de bord et historique de vos scores pour suivre l'évolution."
              icon="ChartBarIcon"
              size="tall"
              accent="bg-emerald-50"
            >
              <div className="mt-6 space-y-2">
                <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-[#135ef2] rounded-full"></div>
                </div>
                <p className="text-xs text-[#64748b]">Progression: 75%</p>
              </div>
            </BentoCard>
          </div>

          {/* Card 3 — Regular */}
          <div className="md:col-span-1 lg:col-span-1">
            <BentoCard
              title="Corrections professionnelles"
              description="Productions écrites corrigées et feedback oral personnalisé."
              icon="DocumentTextIcon"
              size="regular"
              accent="bg-orange-50"
            />
          </div>

          {/* Card 4 — Regular */}
          <div className="md:col-span-1 lg:col-span-1">
            <BentoCard
              title="Ressources stratégiques"
              description="Vidéos, fiches méthodologiques et exemples corrigés."
              icon="VideoCameraIcon"
              size="regular"
              accent="bg-purple-50"
            />
          </div>

          {/* Card 5 — Regular */}
          <div className="md:col-span-1 lg:col-span-1">
            <BentoCard
              title="Accès 24/7"
              description="Révise à votre rythme, sur mobile et desktop."
              icon="DevicePhoneMobileIcon"
              size="regular"
              accent="bg-pink-50"
            />
          </div>

          {/* Card 6 — Regular */}
          <div className="md:col-span-1 lg:col-span-1">
            <BentoCard
              title="Communauté active"
              description="Échangez avec d'autres étudiants et partagez vos expériences."
              icon="UserGroupIcon"
              size="regular"
              accent="bg-cyan-50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface BentoCardProps {
  title: string;
  description: string;
  icon: string;
  size: 'large' | 'tall' | 'regular';
  accent: string;
  children?: React.ReactNode;
}

function BentoCard({ title, description, icon, size, accent, children }: BentoCardProps) {
  const sizeClasses = {
    large: 'p-8 h-full',
    tall: 'p-6 h-full',
    regular: 'p-6 h-64',
  };

  return (
    <div className={`rounded-2xl border border-[#e5e7eb] bg-white shadow-sm hover:shadow-md transition-all duration-300 ${sizeClasses[size]}`}>
      <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center mb-4`}>
        <Icon name={icon as any} size={24} className="text-[#135ef2]" />
      </div>
      <h3 className="text-lg font-bold text-[#0f172a] mb-2">{title}</h3>
      <p className="text-sm text-[#64748b] leading-relaxed mb-0">{description}</p>
      {children}
    </div>
  );
}

export default BenefitsSection;
