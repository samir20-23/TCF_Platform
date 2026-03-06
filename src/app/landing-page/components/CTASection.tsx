'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface CTASectionProps {
  title: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const CTASection = ({ title, description, primaryCtaText, primaryCtaLink, secondaryCtaText, secondaryCtaLink }: CTASectionProps) => {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="section-container">
        {/* Dark CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24 text-center">
          
          {/* Subtle wave background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,150 Q250,50 500,150 T1000,150 L1000,400 L0,400 Z" fill="#135ef2" />
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={primaryCtaLink}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#135ef2] px-8 py-4 text-base font-bold text-white hover:bg-[#1150cc] transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                {primaryCtaText}
              </Link>
              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all duration-200 w-full sm:w-auto"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
