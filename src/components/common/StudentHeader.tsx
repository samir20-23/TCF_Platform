'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Logo from './Logo';

import { useAuth } from '@/contexts/AuthContext';

const StudentHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();

  const navigationItems = [
    { label: 'Tableau de bord', path: '/student-dashboard', icon: 'HomeIcon' },
    { label: 'Profil', path: '/user-profile', icon: 'UserCircleIcon' },
  ];

  const isActivePath = (path: string) => pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };


  const handleLogout = async () => {
    try {
      await signOut();
      // Force clear everything and redirect absolute
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

  return (
    <header className="sticky top-0 z-[1000] bg-card shadow-academic transition-academic">
      <div className="mx-auto max-w-7xl">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          <Logo href="/" />


          <nav className="hidden items-center space-x-2 md:flex">
            {navigationItems.map((item) => {
              const active = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  href={active ? '#' : item.path}
                  aria-disabled={active}
                  className={`flex items-center space-x-2 rounded-md px-6 py-3 font-caption text-sm font-medium transition-academic hover:-translate-y-0.5 hover:shadow-academic-sm ${active
                    ? 'bg-primary text-primary-foreground shadow-academic cursor-default pointer-events-none'
                    : 'text-foreground hover:bg-muted'
                    }`}
                >
                  <Icon name={item.icon as any} size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center space-x-4 md:flex">
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 rounded-md px-4 py-2 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span suppressHydrationWarning className="font-heading text-sm font-semibold">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <Icon name="ChevronDownIcon" size={16} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-popover shadow-academic-md">
                  <div className="py-2">
                    {(isAdmin || profile?.role === 'admin') && (
                      <Link
                        href="/student-dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className={`flex items-center space-x-2 px-4 py-2 font-caption text-sm text-popover-foreground transition-academic hover:bg-muted ${isActivePath('/student-dashboard') ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <Icon name="AcademicCapIcon" size={18} />
                        <span>Tableau de bord étudiante</span>
                      </Link>
                    )}
                    <Link
                      href="/user-profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-4 py-2 font-caption text-sm text-popover-foreground transition-academic hover:bg-muted ${isActivePath('/user-profile') ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <Icon name="UserCircleIcon" size={18} />
                      <span>Mon profil</span>
                    </Link>
                    <Link
                      href="/pricing-plans"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 font-caption text-sm text-popover-foreground transition-academic hover:bg-muted"
                    >
                      <Icon name="CreditCardIcon" size={18} />
                      <span>Abonnement</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center space-x-2 px-4 py-2 font-caption text-sm text-popover-foreground transition-academic hover:bg-muted"
                    >
                      <Icon name="ArrowRightOnRectangleIcon" size={18} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="flex items-center justify-center rounded-md p-2 text-foreground transition-academic hover:bg-muted md:hidden"
            aria-label="Toggle mobile menu"
          >
            <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="border-t border-border bg-card px-6 py-4 md:hidden">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const active = isActivePath(item.path);
                return (
                  <Link
                    key={item.path}
                    href={active ? '#' : item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 rounded-md px-4 py-3 font-caption text-sm font-medium transition-academic ${active
                      ? 'bg-primary text-primary-foreground shadow-academic pointer-events-none'
                      : 'text-foreground hover:bg-muted'
                      }`}
                  >
                    <Icon name={item.icon as any} size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-border pt-2">
                <Link
                  href="/user-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rounded-md px-4 py-3 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted ${isActivePath('/user-profile') ? 'pointer-events-none opacity-50 cursor-default' : ''}`}
                >
                  <Icon name="UserCircleIcon" size={20} />
                  <span>Mon profil</span>
                </Link>
                <Link
                  href="/pricing-plans"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 rounded-md px-4 py-3 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted"
                >
                  <Icon name="CreditCardIcon" size={20} />
                  <span>Abonnement</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center space-x-3 rounded-md px-4 py-3 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted"
                >
                  <Icon name="ArrowRightOnRectangleIcon" size={20} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default StudentHeader;