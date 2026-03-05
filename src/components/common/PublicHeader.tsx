'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

const PublicHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, profile, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll listener for sticky header shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.replace('/user-login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace('/user-login');
    }
  };

  /* ── Navigation items ── */
  const publicNavItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Tarifs', path: '/pricing-plans' },
    { label: 'Guide TCF', path: '/tcf-guide' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => role === 'admin' ? '/admin-dashboard' : '/student-dashboard';

  return (
    <>
      <header
        className={`sticky top-0 z-[1000] glass-header transition-all duration-300 ${isScrolled ? 'shadow-card' : ''
          }`}
        role="banner"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80" aria-label="TCF Canada — Accueil">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                TCF
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block font-heading">
                TCF <span className="text-primary">Canada</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-link-animated px-3 py-2 rounded-md ${isActive(item.path) ? 'active text-primary' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth / User Area */}
            <div className="hidden lg:flex items-center gap-3">
              {!mounted ? (
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary-100 transition-colors duration-200"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {(profile?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{profile?.name || 'Mon compte'}</span>
                    <Icon name="ChevronDownIcon" size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-elevated animate-scale-in origin-top-right z-50">
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{profile?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link href={getDashboardPath()} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                          <Icon name="Squares2X2Icon" size={16} className="text-muted-foreground" />
                          Tableau de bord
                        </Link>
                        {role === 'admin' && (
                          <Link href="/student-dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                            <Icon name="AcademicCapIcon" size={16} className="text-muted-foreground" />
                            Tableau de bord étudiante
                          </Link>
                        )}
                        <Link href="/user-profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                          <Icon name="UserCircleIcon" size={16} className="text-muted-foreground" />
                          Mon profil
                        </Link>
                      </div>
                      <div className="border-t border-border p-1.5">
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Icon name="ArrowRightOnRectangleIcon" size={16} />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/user-login"
                    className="btn-ghost text-sm font-medium"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/user-registration"
                    className="btn-primary text-sm"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted transition-colors lg:hidden"
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de navigation">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Drawer panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-card shadow-modal animate-slide-in-right overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="text-lg font-bold text-foreground">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted transition-colors"
                aria-label="Fermer le menu"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            {/* Mobile nav links */}
            <nav className="px-4 py-4" aria-label="Navigation mobile">
              <div className="space-y-1">
                {publicNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors ${isActive(item.path)
                      ? 'bg-primary-50 text-primary'
                      : 'text-foreground hover:bg-muted'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* User section in mobile menu */}
              <div className="mt-6 pt-6 border-t border-border space-y-1">
                {!mounted ? (
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {(profile?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{profile?.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href={getDashboardPath()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name="Squares2X2Icon" size={18} className="text-muted-foreground" />
                      Tableau de bord
                    </Link>
                    <Link
                      href="/user-profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name="UserCircleIcon" size={18} className="text-muted-foreground" />
                      Mon profil
                    </Link>
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Icon name="ArrowRightOnRectangleIcon" size={18} />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/user-login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-lg px-4 py-3 text-base font-medium text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/user-registration"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-lg px-4 py-3 text-base font-medium text-white bg-primary hover:bg-primary-600 transition-colors"
                    >
                      S&apos;inscrire gratuitement
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicHeader;