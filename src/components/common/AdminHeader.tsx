'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import Logo from './Logo';

const adminOptions = [
    { label: 'Tableau de bord', href: '/admin-dashboard' },
    { label: 'Gestion des plans', href: '/admin-dashboard/plans' },
    { label: 'Gestion des utilisateurs', href: '/admin-user-management' },
    { label: 'Gestion du contenu', href: '/admin-content-management' },
];

const AdminHeader = () => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, profile, signOut } = useAuth();
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = async () => {
        try {
            setIsProfileMenuOpen(false);
            await signOut();
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();
                window.location.replace('/user-login');
            }
        } catch {
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();
                window.location.replace('/user-login');
            }
        }
    };

    return (
        <header className="sticky top-0 z-[1000] h-20 bg-card shadow-academic border-b border-border transition-academic" style={{ alignItems: "center" }}>
            <div className="mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Logo href="/" />

                <nav className="hidden lg:flex items-center space-x-6 relative">
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="px-4 py-2 font-caption text-sm font-medium text-foreground rounded-md transition-academic hover:bg-muted flex items-center space-x-1"
                        >
                            <span>Tableau de bord</span>
                            <Icon name="ChevronDownIcon" size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-60 rounded-md bg-popover shadow-academic-lg border border-border overflow-hidden animate-fade-in">
                                {adminOptions.map((option, i) => (
                                    <Link
                                        key={i}
                                        href={option.href}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="block px-4 py-2 text-sm text-foreground transition-academic hover:bg-muted hover:scale-102"
                                    >
                                        {option.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="flex items-center space-x-4">
                    <div className="hidden lg:flex flex-col items-end text-right">
                        <span className="text-sm font-semibold text-foreground">{mounted ? (profile?.name || user?.email?.split('@')[0]) : '\u00A0'}</span>
                        <span className="text-xs text-muted-foreground capitalize">{mounted ? (profile?.role || 'Admin') : '\u00A0'}</span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={toggleProfileMenu}
                            className="flex items-center space-x-2 rounded-md px-2 py-2 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-primary/20">
                                <span className="font-heading text-sm font-semibold">{mounted ? (profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A') : 'A'}</span>
                            </div>
                            <Icon name="ChevronDownIcon" size={16} />
                        </button>

                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md bg-popover shadow-academic-lg border border-border overflow-hidden animate-fade-in">
                                <div className="py-1">
                                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                                        <p className="text-sm font-medium text-foreground truncate">{profile?.name || 'Admin'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <Link href="/student-dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-popover-foreground transition-academic hover:bg-muted">
                                        <Icon name="AcademicCapIcon" size={18} />
                                        <span>Tableau de bord étudiante</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-popover-foreground transition-academic hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Icon name="ArrowRightOnRectangleIcon" size={18} />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted transition-academic"
                    >
                        <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <nav className="lg:hidden bg-card border-t border-border shadow-academic transition-academic animate-fade-in">
                    <div className="px-4 py-2 flex flex-col space-y-1">
                        <div className="relative">
                            <button className="w-full text-left px-3 py-2 font-caption text-sm font-medium text-foreground rounded-md transition-academic hover:bg-muted flex justify-between items-center">
                                Tableau de bord
                                <Icon name="ChevronDownIcon" size={14} />
                            </button>
                            <div className="ml-2 mt-1 flex flex-col space-y-1">
                                {adminOptions.map((option, i) => (
                                    <Link
                                        key={i}
                                        href={option.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-2 text-sm text-foreground rounded-md hover:bg-muted transition-academic"
                                    >
                                        {option.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-2 font-caption text-sm font-medium text-destructive transition-academic hover:bg-destructive/10 rounded-md"
                        >
                            <Icon name="ArrowRightOnRectangleIcon" size={18} />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default AdminHeader;