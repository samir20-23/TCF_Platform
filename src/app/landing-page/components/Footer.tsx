"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, profile, isAdmin, isStudent, ready } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Avoid rendering interactive parts until auth is ready on client to prevent layout shift
  if (!isHydrated || !ready) {
    return (
      <footer className="bg-[#1f66f2] text-white font-sans border-t border-blue-400 min-h-[400px]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 animate-pulse opacity-20">
          <div className="h-64 bg-blue-900 rounded-2xl"></div>
        </div>
      </footer>
    );
  }

  const getDashboardHref = () => {
    if (isAdmin || profile?.role === 'admin') return '/admin-dashboard';
    if (profile?.role === 'instructor') return '/instructor-dashboard';
    if (isStudent || profile?.role === 'student') return '/student-dashboard';
    return '/user-login';
  };

  const getProfileHref = () => {
    if (!user) return '/user-login';
    return '/user-profile';
  };

  return (
    <footer className="bg-foreground text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Pied de page</h2>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:px-8 border-b border-blue-400/30">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">

          {/* Column 1: About */}
          <div className="flex flex-col lg:col-span-1">
            <h3 className="mb-4 text-xl font-bold tracking-wide border-blue-200 pl-3">TCF Canada</h3>
            <p className="text-sm leading-relaxed text-blue-100/90 pl-3 mb-6">
              Plateforme de préparation au TCF Canada avec simulations réelles, corrections professionnelles et suivi de progression.
            </p> 
            <div className="flex flex-wrap gap-4 pl-3">
              <a href="https://facebook.com">
                <img src="/assets/icons/facebook.png" className="w-6 h-6 hover:scale-110 transition-transform" alt="Facebook" />
              </a>
              <a href="https://instagram.com/">
                <img src="/assets/icons/in.png" className="w-6 h-6 hover:scale-110 transition-transform" alt="Instagram" />
              </a>
              <a href="https://pictory.com/">
                <img src="/assets/icons/p.png" className="w-6 h-6 hover:scale-110 transition-transform" alt="Pictory" />
              </a>
              <a href="https://whatsapp.com">
                <img src="/assets/icons/wsp.png" className="w-6 h-6 hover:scale-110 transition-transform" alt="WhatsApp" />
              </a>
            </div>
          </div>

          {/* Column 2: Plateforme */}
          <div className="flex flex-col">
            <h3 className="mb-4 text-lg font-bold tracking-wide border-white">Plateforme</h3>
            <nav aria-label="Menu Plateforme">
              <ul className="space-y-3">
                <FooterLinkItem href="/tests-pratiques" icon="" label="Tests pratiques" />
                <FooterLinkItem href="/preparation-tcf" icon="" label="Préparation TCF" />
                <FooterLinkItem href="/pricing-plans" icon="" label="Tarifs & abonnements" />
                <FooterLinkItem href="/tcf-guide" icon="" label="Guide TCF Canada" />
              </ul>
            </nav>
          </div>

          {/* Column 3: Épreuves */}
          <div className="flex flex-col">
            <h3 className="mb-4 text-lg font-bold tracking-wide border-white">Épreuves</h3>
            <nav aria-label="Menu Épreuves">
              <ul className="space-y-3">
                <FooterLinkItem href="/epreuves/comprehension-orale" icon="" label="Compréhension orale" />
                <FooterLinkItem href="/epreuves/comprehension-ecrite" icon="" label="Compréhension écrite" />
                <FooterLinkItem href="/epreuves/expression-orale" icon="" label="Expression orale" />
                <FooterLinkItem href="/epreuves/expression-ecrite" icon="" label="Expression écrite" />
              </ul>
            </nav>
          </div>

          {/* Column 4: Ressources */}
          <div className="flex flex-col">
            <h3 className="mb-4 text-lg font-bold tracking-wide border-white">Ressources</h3>
            <nav aria-label="Menu Ressources">
              <ul className="space-y-3">
                <FooterLinkItem href="/blog" icon="" label="Blog" />
                <FooterLinkItem href="/conseils-tcf" icon="" label="Conseils pour le TCF" />
                <FooterLinkItem href="/faq" icon="" label="FAQ" />
                <FooterLinkItem href="/contact" icon="" label="Contact" />
              </ul>
            </nav>
          </div>

          {/* Column 5: Légal */}
          <div className="flex flex-col">
            <h3 className="mb-4 text-lg font-bold tracking-wide border-white">Légal</h3>
            <nav aria-label="Menu Légal">
              <ul className="space-y-3">
                <FooterLinkItem href="/terms" icon="" label="Conditions générales" />
                <FooterLinkItem href="/privacy-policy" icon="" label="Politique de confidentialité" />
                <FooterLinkItem href="/legal-mentions" icon="" label="Mentions légales" />
              </ul>
            </nav>
          </div>

        </div>
      </div>

      {/* Call To Action & Bottom Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 bg-white/10 p-6 rounded-2xl border border-white/20 w-full md:w-auto">
            <h3 className="text-xl font-bold mb-2">Commencer</h3>
            <p className="text-sm text-blue-100 mb-4">Inscrivez vous et accédez immédiatement aux tests.</p>
            <div className="flex gap-4">
              <Link href="/user-registration" className="bg-white text-blue-700 font-bold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors shadow-lg shadow-black/10">
                Créer un compte
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end justify-center w-full md:w-auto mt-4 md:mt-0 text-blue-100/80">
            <p className="text-sm font-medium tracking-wide mb-2 uppercase">
              &copy; {new Date().getFullYear()} TCF Canada
            </p>
            <div className="flex items-center space-x-2 bg-blue-900/40 px-3 py-1.5 rounded-full border border-blue-400/20">
              <Icon name="ShieldCheckIcon" size={16} className="text-green-400" />
              <span className="text-xs font-semibold">Paiement sécurisé par Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Sub-components ---

const FooterLinkItem = ({ href, icon, label }: { href: string; icon?: string; label: string }) => (
  <li>
    <Link href={href} className="group flex items-center space-x-3 text-sm text-blue-100 hover:text-white transition-all">
      {icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/20 transition-colors">
          <Icon name={icon} size={18} className="text-white" />
        </div>
      )}
      <span className="border-b border-transparent group-hover:border-white/40 pb-0.5">{label}</span>
    </Link>
  </li>
);

const FooterSocialLink = ({ href, label, bgClass, iconName }: { href: string; label: string; bgClass: string; iconName: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgClass} shadow-lg transition-all hover:-translate-y-1 hover:brightness-110`}
  >
    <Icon name={iconName} size={20} className="text-white" />
  </a>
);

const PaymentIcon = ({ src, alt, label }: { src: string; alt: string; label: string }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex items-center justify-center h-7 px-1" title={alt}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[9px] font-bold text-white/50 border border-white/20 px-2 py-0.5 rounded italic">
          {label}
        </span>
      )}
    </div>
  );
};

export default Footer;
