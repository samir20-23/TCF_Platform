'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string;
  role: string;
  status: string;
  created_at: string;
}

interface Attempt {
  id: string;
  test_id: string;
  status: string;
  score_total: number;
  created_at: string;
  tests: {
    name: string;
    test_type: string;
  }
}

interface UserSubscription {
  id: string;
  status: string;
  start_at: string;
  end_at: string;
  plans: {
    name: string;
  }
}

// Generate initials for avatar fallback
const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Generate a color based on user ID for avatar background
const getAvatarColor = (id: string): string => {
  const colors = [
    'bg-primary',
    'bg-blue-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function UserProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const userId = searchParams.get('uid');

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    if (!userId) {
      router.push('/admin-user-management');
      return;
    }
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch user profile (using users table rather than user_profiles based on new schema)
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        toast.error('Utilisateur non trouvé');
        setUser(null);
        setLoading(false);
        return;
      }
      // @ts-ignore (we know properties exist via implicit usage)
      setUser(profileData);

      // Fetch subscriptions
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, plans(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setSubscriptions(subData || []);

      // Fetch attempts/analytics
      const { data: attemptsData } = await supabase
        .from('attempts')
        .select(`
          id,
          test_id,
          status,
          score_total,
          created_at,
          tests:tests(name, test_type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setAttempts(attemptsData || []);

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
          <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
          <div className="h-48 animate-pulse rounded-lg bg-muted"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl text-center">
          <Icon name="UserIcon" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Utilisateur non trouvé</h1>
          <Link href="/admin-user-management" className="mt-4 inline-block text-primary hover:underline">
            Retour à la gestion des utilisateurs
          </Link>
        </div>
      </div>
    );
  }

  const displayName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Utilisateur';

  const completedAttempts = attempts.filter(a => a.status === 'finished').length;
  const inProgressAttempts = attempts.filter(a => a.status !== 'finished').length;
  const totalAttempts = attempts.length || 1;
  const progressPercent = Math.round((completedAttempts / totalAttempts) * 100);

  const statusColors: Record<string, string> = {
    Actif: 'bg-green-100 text-green-800',
    Inactif: 'bg-gray-100 text-gray-800',
    Suspendu: 'bg-red-100 text-red-800',
  };

  const getSubColor = (status: string) => status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeftIcon" size={20} />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Profil utilisateur</h1>
        </div>

        {/* Profile Card */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className={`h-24 w-24 flex-shrink-0 rounded-full flex items-center justify-center ${user.avatar_url ? '' : getAvatarColor(user.id)}`}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`text-2xl font-bold text-white ${user.avatar_url ? 'hidden' : ''}`}>
                {getInitials(displayName)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColors[user.status] || statusColors.Actif}`}>
                  {user.status || 'Actif'}
                </span>
                <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
                  {user.role || 'student'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Inscription</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-CA')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dernier test</p>
                  <p className="text-sm font-medium text-foreground">
                    {attempts.length > 0
                      ? new Date(attempts[0].created_at).toLocaleDateString('fr-CA')
                      : 'Jamais'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tests terminés</p>
                  <p className="text-sm font-medium text-foreground">
                    {completedAttempts}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tests en cours</p>
                  <p className="text-sm font-medium text-foreground">
                    {inProgressAttempts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Overview */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Abonnements (Plans achetés)</h3>
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map(sub => (
                <div key={sub.id} className="p-4 border border-border rounded-lg bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{sub.plans?.name || 'Plan Inconnu'}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getSubColor(sub.status)}`}>{sub.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>Début: {new Date(sub.start_at).toLocaleDateString('fr-CA')}</p>
                    <p>Fin: {sub.end_at ? new Date(sub.end_at).toLocaleDateString('fr-CA') : 'À vie'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Cet utilisateur n'a aucun abonnement.</p>
          )}
        </div>

        {/* Progress Overview */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Analyses & Statistiques</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taux de tests complétés</span>
              <span className="font-medium text-foreground">{progressPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {completedAttempts} tests réussis ou terminés sur {totalAttempts} passes.
            </p>
          </div>
        </div>

        {/* Test Analytics History */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Historique & Réponses</h3>
          {attempts.length > 0 ? (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center gap-4 rounded-md border border-border p-3"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${attempt.status === 'finished' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {attempt.status === 'finished' ? (
                      <Icon name="CheckIcon" size={16} />
                    ) : (
                      <Icon name="ClockIcon" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {attempt.tests?.name || 'Test TCF'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Statut: {attempt.status === 'finished' ? 'Terminé' : 'En cours'} • Score: {attempt.score_total || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.created_at).toLocaleDateString('fr-CA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="AcademicCapIcon" size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aucune activité d'apprentissage</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin-user-management"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Icon name="ArrowLeftIcon" size={16} />
            Retour à la liste
          </Link>
        </div>
      </div>
    </div>
  );
}
