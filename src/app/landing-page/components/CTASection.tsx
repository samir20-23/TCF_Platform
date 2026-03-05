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
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="section-container">
        <div className="relative overflow-hidden rounded-xl bg-primary px-6 sm:px-12 lg:px-16 py-12 sm:py-16 lg:py-20 text-center shadow-sm">

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={primaryCtaLink}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-8 py-3.5 text-base font-bold text-primary hover:bg-white/90 transition-colors duration-200 shadow-sm w-full sm:w-auto"
              >
                {primaryCtaText}
              </Link>
              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors duration-200 w-full sm:w-auto"
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
