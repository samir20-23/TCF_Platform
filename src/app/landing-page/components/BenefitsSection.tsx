'use client';

import React, { useEffect, useRef } from 'react';
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
  // Color schemes for icon backgrounds to add variety
  const colorSchemes = [
    { bg: 'bg-primary-50', text: 'text-primary-600' },
    { bg: 'bg-orange-50', text: 'text-orange-600' },
    { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-rose-50', text: 'text-rose-600' },
    { bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div className="section-heading">
          <h2>Pourquoi choisir TCF Canada ?</h2>
          <p>Une plateforme complète conçue pour maximiser vos chances de réussite</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, idx) => {
            const colors = colorSchemes[idx % colorSchemes.length];
            return (
              <div
                key={benefit.id}
                className="group flex flex-col rounded-lg bg-card border border-border p-6 lg:p-8 shadow-sm transition-shadow duration-200 hover:shadow"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} transition-colors duration-300 group-hover:scale-110`}>
                  <Icon name={benefit.icon as any} size={24} className={colors.text} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
