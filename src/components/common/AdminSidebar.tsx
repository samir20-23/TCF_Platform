'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface AdminSidebarProps {
  isCollapsed?: boolean;
}

const AdminSidebar = ({ isCollapsed = false }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navigationItems = [
    {
      label: 'Tableau de bord',
      path: '/admin-dashboard',
      icon: 'ChartBarIcon',
      description: 'Vue d\'ensemble'
    },
    {
      label: 'Gestion des plans',
      path: '/admin-dashboard/plans',
      icon: 'CurrencyDollarIcon',
      description: 'Tarification et options'
    },
    {
      label: 'Gestion des utilisateurs',
      path: '/admin-user-management',
      icon: 'UsersIcon',
      description: 'Utilisateurs et abonnements'
    },
    {
      label: 'Gestion du contenu',
      path: '/admin-content-management',
      icon: 'DocumentTextIcon',
      description: 'Tests et ressources'
    },
    {
      label: 'Tentatives',
      path: '/admin-dashboard/attempts',
      icon: 'ClipboardDocumentListIcon',
      description: 'Inspecter & gérer les tentatives'
    },
    {
      label: 'Corrections',
      path: '/admin-dashboard/reviewer',
      icon: 'PencilSquareIcon',
      description: 'Corriger les réponses ouvertes'
    },
  ];


  const isActivePath = (path: string) => pathname === path;

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between border-b border-border p-4" style={{ filter: "blur(12px)" }}>
        {!collapsed && (
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Dashboard
          </h2>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden lg:block rounded-md p-2 text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
            size={20}
          />
        </button>
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden rounded-md p-2 text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
          aria-label="Fermer le menu"
        >
          <Icon name="XMarkIcon" size={24} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 rounded-md px-4 py-3 font-caption text-sm font-medium transition-academic hover:-translate-y-0.5 hover:shadow-academic-sm ${isActivePath(item.path)
                ? 'bg-primary text-primary-foreground shadow-academic'
                : 'text-foreground hover:bg-muted'
                }`}
              title={collapsed ? item.label : ''}
            >
              <Icon name={item.icon as any} size={20} />
              {(!collapsed || mobileOpen) && (
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/landing-page"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center space-x-3 rounded-md px-4 py-3 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted ${collapsed && !mobileOpen ? 'justify-center' : ''
            }`}
          title={collapsed ? 'Retour au site' : ''}
        >
          <Icon name="ArrowLeftIcon" size={20} />
          {(!collapsed || mobileOpen) && <span>Retour au site</span>}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed  top-15 z-[90] rounded-md bg-card p-2 shadow-md border border-border text-foreground hover:bg-muted transition-all"
        aria-label="Ouvrir le menu"
      >
        <Icon name="ChevronRightIcon" size={24} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[99] bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 z-[100] h-full w-72 bg-card border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col pt-20">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex lg:fixed left-0 top-20 z-[100] h-[calc(100vh-5rem)] border-r border-border bg-card shadow-academic transition-academic flex-col ${collapsed ? 'w-20' : 'w-72'
          }`}
      >  
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
