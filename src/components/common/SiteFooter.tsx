'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const footerLinks = {
    plateforme: [
        { label: 'Tarifs & Abonnements', href: '/pricing-plans' },
        { label: 'Guide TCF Canada', href: '/tcf-guide' },
        { label: 'Tests pratiques', href: '/practice-tests' },
        { label: 'FAQ', href: '/faq' },
    ],
    ressources: [
        { label: 'Compréhension orale', href: '/tcf-guide#co' },
        { label: 'Compréhension écrite', href: '/tcf-guide#ce' },
        { label: 'Expression orale', href: '/tcf-guide#eo' },
        { label: 'Expression écrite', href: '/tcf-guide#ee' },
    ],
    legal: [
        { label: 'Conditions générales', href: '/terms-of-service' },
        { label: 'Politique de confidentialité', href: '/privacy-policy' },
        { label: 'Contact', href: '/contact' },
    ],
};

export default function SiteFooter() {
    return (
        <footer className="bg-foreground text-white" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Pied de page</h2>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Main footer content */}
                <div className="grid grid-cols-1 gap-10 py-12 sm:py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

                    {/* Brand column */}
                    <div className="sm:col-span-2 lg:col-span-1"> 
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
                                TCF
                            </div>
                            <span className="text-lg font-bold">
                                TCF <span className="text-primary-300">Canada</span>
                            </span> 
                        </Link> 
                        <p className="text-sm text-white/60 leading-relaxed max-w-xs mb-6">
                            Plateforme de préparation au TCF Canada. Simulations chronométrées, corrections professionnelles et suivi personnalisé.
                        </p>
                        {/* Social links */}
                        <div className="flex items-center gap-3">
                            <div className="flex flex-wrap gap-4 mb-10">

                                <a href="https://facebook.com" target="_blank"> <img src="/assets/icons/facebook.png" className="w-7 h-7" style={{ filter: "invert(0.3)" }} /></a>
                                <a href="https://Fwhatsapp.com" target="_blank"> <img src="/assets/icons/wsp.png" className="w-7 h-7" style={{ filter: "invert(0.3)" }} /></a>
                                <a href="https://pinterest.com/" target="_blank"> <img src="/assets/icons/p.png" className="w-7 h-7" style={{ filter: "invert(0.3)" }} /></a>
                                <a href="https://www.linkedin.com/" target="_blank"> <img src="/assets/icons/in.png" className="w-7 h-7" style={{ filter: "invert(0.3)" }} /></a>
                            </div>
                            {/* <SocialLink href="https://facebook.com" label="Facebook" icon="f" />
                            <SocialLink href="https://linkedin.com" label="LinkedIn" icon="in" />
                            <SocialLink href="https://wa.me/" label="WhatsApp" icon="wa" /> */}
                        </div>
                    </div>

                    {/* Plateforme column */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Plateforme</h3>
                        <ul className="space-y-3">
                            {footerLinks.plateforme.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Ressources column */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Épreuves TCF</h3>
                        <ul className="space-y-3">
                            {footerLinks.ressources.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA column */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Commencer</h3>
                        <p className="text-sm text-white/60 mb-4">
                            Inscrivez-vous et accédez à vos tests immédiatement.
                        </p>
                        <Link
                            href="/user-registration"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors duration-200 w-full sm:w-auto"
                        >
                            Créer un compte
                            <Icon name="ArrowRightIcon" size={16} />
                        </Link>
                        <div className="mt-6">
                            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Légal</h4>
                            <ul className="space-y-2">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/40">
                        &copy; {new Date().getFullYear()} TCF Canada. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/30">Paiement sécurisé par Stripe</span>
                        <Icon name="ShieldCheckIcon" size={16} className="text-white/30" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ── Social link helper ── */
function SocialLink({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/60 text-xs font-bold uppercase hover:bg-primary hover:text-white transition-colors duration-200"
        >
            {icon}
        </a>
    );
}
