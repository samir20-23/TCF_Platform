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
    <section className="section-padding bg-background">
      <div className="section-container">
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-center">
            Comment ça fonctionne
          </h2>
          <p className="text-lg text-[#64748b] text-center max-w-2xl mx-auto">
            Un parcours simple et efficace vers votre réussite au TCF Canada
          </p>
        </div>

        {/* Vertical Stepper */}
        <div className="max-w-2xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative flex gap-8">
              
              {/* Left Column — Timeline */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Step Circle */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#135ef2] text-white font-bold text-2xl shadow-md">
                  {step.id}
                </div>

                {/* Vertical Line (not on last step) */}
                {idx < steps.length - 1 && (
                  <div className="w-1 h-24 bg-[#dbeafe] mt-4 mb-4 rounded-full"></div>
                )}
              </div>

              {/* Right Column — Content */}
              <div className="flex-1 pb-12 pt-2">
                <h3 className="text-2xl font-bold text-[#0f172a] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#64748b] leading-relaxed">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
