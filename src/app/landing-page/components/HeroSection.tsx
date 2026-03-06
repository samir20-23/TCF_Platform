'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useState } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const HeroSection = ({ title, subtitle, ctaText, ctaLink }: HeroSectionProps) => {
  const [email, setEmail] = useState('');

  return (
    <section className="relative overflow-hidden bg-[#f4f7f9] py-16 sm:py-24 lg:py-32">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column — Text */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-[#e5e7eb] px-4 py-1.5 text-sm font-medium text-foreground mb-6 w-fit">
              <Icon name="AcademicCapIcon" size={16} className="text-[#135ef2]" />
              <span>La plateforme #1 de préparation au TCF Canada</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Maîtrisez votre <span className="text-[#135ef2]">examen TCF</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#64748b] leading-relaxed mb-10 max-w-md">
              {subtitle}
            </p>

            {/* Email CTA Input with Button */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="flex-1 rounded-lg border border-[#e5e7eb] bg-white px-5 py-3 text-foreground placeholder:text-[#64748b] focus:border-[#135ef2] focus:outline-none focus:ring-2 focus:ring-[#135ef2]/20 transition-all"
                />
                <Link
                  href={ctaLink}
                  className="rounded-lg bg-[#135ef2] text-white px-6 py-3 font-semibold hover:bg-[#1150cc] transition-all whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  {ctaText}
                </Link>
              </div>
            </div>

            {/* Secondary CTA */}
            <Link href="/pricing-plans" className="text-[#135ef2] font-semibold hover:underline text-sm">
              Voir nos plans de tarification →
            </Link>
          </div>

          {/* Right Column — Dashboard Mockup */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Outer card container with shadow */}
              <div className="rounded-2xl border border-[#e5e7eb] bg-white shadow-lg overflow-hidden">
                
                {/* Card header */}
                <div className="bg-gradient-to-r from-[#135ef2] to-[#1150cc] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Mon tableau de bord</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                    </div>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-6 space-y-6">
                  
                  {/* Score section */}
                  <div className="text-center">
                    <p className="text-sm text-[#64748b] mb-2">Mon score</p>
                    <p className="text-4xl font-bold text-[#0f172a]">520<span className="text-lg text-[#64748b]">/699</span></p>
                  </div>

                  {/* Progress ring */}
                  <div className="flex justify-center items-center relative h-32 w-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#135ef2"
                        strokeWidth="3"
                        strokeDasharray={`${45 * 2 * Math.PI * 0.74} ${45 * 2 * Math.PI}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#0f172a]">74%</p>
                        <p className="text-xs text-[#64748b]">réussite</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-[#f4f7f9] p-3 text-center">
                      <p className="text-xs text-[#64748b] mb-1">Tests complétés</p>
                      <p className="text-2xl font-bold text-[#0f172a]">8</p>
                    </div>
                    <div className="rounded-lg bg-[#f4f7f9] p-3 text-center">
                      <p className="text-xs text-[#64748b] mb-1">Jours de suite</p>
                      <p className="text-2xl font-bold text-[#0f172a]">5</p>
                    </div>
                  </div>

                  {/* Mini notification cards */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-[#eff4ff] border border-[#dbeafe]">
                      <Icon name="CheckCircleIcon" size={16} className="text-[#135ef2] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#0f172a]">Nouveau test disponible</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar — Below the split layout */}
        <div className="mt-16 pt-12 border-t border-[#e5e7eb]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <TrustStat value="500+" label="Étudiants actifs" />
            <TrustStat value="4.8/5" label="Satisfaction clients" />
            <TrustStat value="24/7" label="Accès illimité" />
            <TrustStat value="100%" label="Paiements sécurisés" />
          </div>
        </div>
      </div>
    </section>
  );
};

function TrustStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-1">{value}</p>
      <p className="text-sm text-[#64748b]">{label}</p>
    </div>
  );
}

export default HeroSection;
