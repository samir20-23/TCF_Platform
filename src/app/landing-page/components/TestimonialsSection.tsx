'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  achievement?: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection = ({ testimonials }: TestimonialsSectionProps) => {
  // Duplicate for smooth infinite loop
  const duplicated = [...testimonials, ...testimonials];

  return (
    <section className="section-padding bg-muted/30 overflow-hidden" id="testimonials">
      <div className="section-container mb-12">
        <div className="section-heading text-center">
          <h2 className="text-3xl font-bold mb-2">Ce que disent nos étudiants</h2>
          <p className="text-muted-foreground">Des résultats réels, des témoignages authentiques</p>
        </div>
      </div>

      {/* Marquee container */}
      <div className="w-full overflow-hidden relative">
        <div className="flex gap-6 marquee">
          {duplicated.map((t, idx) => (
            <div key={`${t.id}-${idx}`} className="flex-shrink-0 w-[340px] sm:w-[380px]">
              <div className="h-full flex flex-col rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Icon key={i} name="StarIcon" size={16} className="text-amber-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm flex-1 mb-4">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="flex items-center gap-3 border-t border-border pt-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700 font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  {t.achievement && (
                    <span className="text-[11px] font-semibold text-primary bg-primary-50 px-2 py-1 rounded-full whitespace-nowrap">
                      {t.achievement}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee {
          display: flex;
          flex-wrap: nowrap;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;