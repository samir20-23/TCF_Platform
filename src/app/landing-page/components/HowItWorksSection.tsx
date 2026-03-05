'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Step {
  id: number;
  title: string;
  text: string;
}

interface HowItWorksSectionProps {
  steps: Step[];
}

const HowItWorksSection = ({ steps }: HowItWorksSectionProps) => {
  const icons = ['CursorArrowRaysIcon', 'BoltIcon', 'DocumentTextIcon', 'CheckBadgeIcon'];

  return (
    <section className="section-padding bg-muted/30">
      <div className="section-container">
        <div className="section-heading">
          <h2>Comment ça fonctionne</h2>
          <p>Un parcours simple et efficace vers votre réussite au TCF Canada</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex flex-col items-center text-center group">
              {/* Connector line — hidden on last item and mobile */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-px bg-border z-0" />
              )}

              {/* Step number circle */}
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow-primary mb-5 transition-transform duration-300 group-hover:scale-110">
                <Icon name={icons[idx] as any} size={28} />
              </div>

              {/* Step number */}
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Étape {step.id}
              </span>

              {/* Title */}
              <h3 className="text-base font-semibold text-foreground mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;