'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile, UserRole } from '@/types/database.types';

interface SignUpOptions {
  shouldRedirect?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, options?: SignUpOptions) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  forceRefreshProfile: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  isAdmin: boolean;
  isStudent: boolean;
  profileError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  // If Supabase is not configured, set ready immediately
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      setLoading(false);
    }
  }, [supabase]);

  const fetchProfile = useCallback(async (userId: string, signal?: AbortSignal): Promise<UserProfile | null> => {
    try {
      setProfileError(null);
      const resp = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .abortSignal(signal as AbortSignal);

      const { data, error } = resp as any;

      if (error) {
        if (error.message?.includes('AbortError') || error.name === 'AbortError' || error.message?.includes('aborted')) {
          return null;
        }
        console.error('Error fetching profile:', error.message);
        if (error.code === 'PGRST116') {
          setProfileError('Votre profil n\'existe pas encore. Contactez un administrateur.');
        }
        setProfile(null);
        setRole(null);
        return null;
      }

      if (data) {
        let row: any = null;
        if (Array.isArray(data)) {
          if (data.length === 0) {
            setProfile(null);
            setRole(null);
            setProfileError('Votre profil n\'existe pas encore. Contactez un administrateur.');
            return null;
          }
          if (data.length > 1) {
            console.warn(`fetchProfile: multiple user rows found for id=${userId}, using the first one`);
          }
          row = data[0];
        } else {
          row = data;
        }

        if (row) {
          setProfile(row as UserProfile);
          setRole((row.role || null) as UserRole | null);
          return row as UserProfile;
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return null;
      }
      console.error('Unexpected error fetching profile:', err);
      setProfileError('Erreur inattendue lors du chargement du profil.');
    }
    return null;
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    let subscription: any = null;

    const setupAuth = async () => {
      setLoading(true);
      
      // If Supabase is not configured, skip auth setup
      if (!supabase) {
        setLoading(false);
        setReady(true);
        return;
      }

      try {
        // 1. Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted || abortController.signal.aborted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id, abortController.signal);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.message?.includes('aborted') || abortController.signal.aborted) {
          return;
        }
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted && !abortController.signal.aborted) {
          setLoading(false);
          setReady(true);
        }
      }

      // 2. Subscribe only after initial getSession completes avoiding concurrent LockManager access
      if (mounted && !abortController.signal.aborted) {
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (!mounted || abortController.signal.aborted) return;
          if (event === 'INITIAL_SESSION') return;

          const newUser = currentSession?.user ?? null;
          setSession(currentSession);

          if (newUser) {
            setUser((prevUser) => {
              if (prevUser?.id !== newUser.id) {
                fetchProfile(newUser.id, abortController.signal).catch(console.error);
              }
              return newUser;
            });
          } else {
            setUser(null);
            setProfile(null);
            setRole(null);
            setProfileError(null);
          }

          if (event === 'SIGNED_OUT') {
            window.localStorage.clear();
            window.sessionStorage.clear();
            router.refresh();
            window.location.replace('/user-login');
          }
        });
        subscription = data.subscription;
      }
    };

    setupAuth();

    return () => {
      mounted = false;
      abortController.abort();
      if (subscription) subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, router]);

  // Online status heartbeat
  useEffect(() => {
    if (!user) return;
    const updateHeartbeat = () => {
      supabase.from('users').update({ updated_at: new Date().toISOString() }).eq('id', user.id).then();
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [user, supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication is not configured');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      const p = await fetchProfile(data.user.id);

      // Check if user is suspended
      if (p?.status === 'Suspendu') {
        await supabase.auth.signOut();
        throw new Error('Votre compte a été suspendu. Contactez un administrateur.');
      }

      // Determine redirect based on fresh DB role
      const target = p?.role === 'admin'
        ? '/admin-dashboard'
        : '/student-dashboard';

      router.push(target);
      router.refresh();
    }
  }, [supabase, fetchProfile, router]);

  const signUp = useCallback(async (email: string, password: string, name: string, options: SignUpOptions = { shouldRedirect: true }) => {
    if (!supabase) {
      return { data: null, error: new Error('Authentication is not configured') };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name, role: 'student' },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) return { data: null, error };

    if (data.user && !data.user.identities?.length) {
      return { data: null, error: new Error('Un compte avec cet email existe déjà.') };
    }

    // Create the public.users row via server route (service role)
    if (data.user) {
      try {
        await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email,
            name,
          }),
        });
      } catch (err) {
        // Non-fatal: the DB trigger will also create the row as a fallback
        console.warn('Could not call create-user API, DB trigger should handle it:', err);
      }

      // Fetch profile so state is populated
      await fetchProfile(data.user.id);
    }

    // Redirect to login — user needs to confirm email
    if (options.shouldRedirect) {
      router.push('/user-login?message=check-email');
    }

    return { data, error: null };
  }, [supabase, router, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }

      setUser(null);
      setProfile(null);
      setRole(null);
      setSession(null);
      setProfileError(null);

      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.href = '/user-login';
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      if (typeof window !== 'undefined') {
        window.location.href = '/user-login';
      }
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id);
  }, [user?.id, fetchProfile]);

  /** Force-refresh profile from server endpoint (bypasses client cache) */
  const forceRefreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const { profile: freshProfile } = await res.json();
        if (freshProfile) {
          setProfile(freshProfile as UserProfile);
          setRole((freshProfile.role || null) as UserRole | null);
        }
      }
    } catch (err) {
      console.error('forceRefreshProfile failed:', err);
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: new Error('Authentication is not configured') };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { error };
  }, [supabase]);

  // Refresh profile when navigating to admin routes to ensure role is fresh
  useEffect(() => {
    if (ready && user && pathname?.startsWith('/admin')) {
      forceRefreshProfile();
    }
  }, [pathname, ready, user, forceRefreshProfile]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    role,
    loading,
    ready,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    forceRefreshProfile,
    resendVerification,
    isAdmin: role === 'admin',
    isStudent: role === 'student',
    profileError,
  }), [user, session, profile, role, loading, ready, signIn, signUp, signOut, refreshProfile, forceRefreshProfile, resendVerification, profileError]);


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
