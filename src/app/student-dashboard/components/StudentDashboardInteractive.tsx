'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeBanner from './WelcomeBanner';
import AchievementBadges from './AchievementBadges';
import SubscriptionStatus from './SubscriptionStatus';
import QuickActions from './QuickActions';
import Icon from '@/components/ui/AppIcon';

interface TestAccess {
  id: string;
  remainingAttempts: number;
  test: {
    id: string;
    name: string;
    testType: string;
    durationMinutes: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate: string;
  isNew: boolean;
}

interface DashboardData {
  userName: string;
  motivationalMessage: string;
  testAccesses: TestAccess[];
  completedTests: number;
  achievements: Achievement[];
  subscription: {
    planName: string;
    planType: string;
    expiryDate?: string;
    daysRemaining?: number;
  };
  recentAttempts: any[];
}

const StudentDashboardInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user && isHydrated) {
      loadDashboardData();
    }
  }, [user, isHydrated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/dashboard');
      const data = await response.json();

      if (response.ok) {
        const { profile, stats, subscription, testAccess, recentAttempts } = data;

        const transformedTestAccesses: TestAccess[] = (testAccess || []).map((access: any) => {
          const testData = access.plan_tests?.tests || {};
          return {
            id: access.id,
            remainingAttempts: access.remaining_attempts,
            test: {
              id: testData.id || '',
              name: testData.name || 'Test',
              testType: testData.test_type || 'unknown',
              durationMinutes: testData.duration_minutes || 60,
            }
          };
        });

        let daysRemaining: number | undefined;
        if (subscription?.expiry_date) {
          const expiryDate = new Date(subscription.expiry_date);
          const today = new Date();
          daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        }

        setDashboardData({
          userName: profile?.name || user?.email?.split('@')[0] || 'Utilisateur',
          motivationalMessage: stats?.completed_tests_count > 0
            ? `Excellent travail! Vous avez déjà complété ${stats.completed_tests_count} tests.`
            : "Bienvenue! Commencez votre préparation en lançant un test ci-dessous.",
          testAccesses: transformedTestAccesses,
          completedTests: stats?.completed_tests_count || 0,
          achievements: [],
          subscription: {
            planName: subscription?.plans?.name || subscription?.subscription_type || 'Bronze',
            planType: subscription?.subscription_type || 'Bronze',
            expiryDate: subscription?.expiry_date ? new Date(subscription.expiry_date).toLocaleDateString('fr-CA') : undefined,
            daysRemaining,
          },
          recentAttempts: recentAttempts || [],
        });

      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading || (!dashboardData && loading)) {
    return (
      <div className="space-y-8">
        <div className="h-32 animate-pulse rounded-lg bg-muted"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-xl font-bold">Une erreur est survenue</h2>
        <p className="mb-4 text-muted-foreground">Nous n&apos;avons pas pu charger vos données.</p>
        <button
          onClick={loadDashboardData}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const getTestIcon = (type: string) => {
    switch (type) {
      case 'reading': return 'BookOpenIcon';
      case 'listening': return 'SpeakerWaveIcon';
      case 'writing': return 'PencilSquareIcon';
      case 'speaking': return 'MicrophoneIcon';
      default: return 'DocumentTextIcon';
    }
  };

  const getTestLabel = (type: string) => {
    switch (type) {
      case 'reading': return 'Compréhension écrite';
      case 'listening': return 'Compréhension orale';
      case 'writing': return 'Expression écrite';
      case 'speaking': return 'Expression orale';
      default: return 'Test';
    }
  };

  return (
    <div className="space-y-8">
      <WelcomeBanner
        userName={dashboardData.userName}
        motivationalMessage={dashboardData.motivationalMessage}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Mes Tests Disponibles
            </h2>
            {dashboardData.testAccesses.length === 0 && (
              <a href="/pricing-plans" className="text-sm font-medium text-primary hover:underline">
                Voir les plans
              </a>
            )}
          </div>

          <div className="space-y-4">
            {dashboardData.testAccesses.map((access) => (
              <div key={access.id} className="flex flex-col sm:flex-row items-center justify-between bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0 w-full sm:w-auto">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <Icon name={getTestIcon(access.test.testType) as any} size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{access.test.name}</h3>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center"><Icon name="ClockIcon" size={14} className="mr-1" /> {access.test.durationMinutes} min</span>
                      <span className="flex items-center"><Icon name="TagIcon" size={14} className="mr-1" /> {getTestLabel(access.test.testType)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end space-x-4">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Restants</span>
                    <span className={`font-bold text-lg ${access.remainingAttempts > 0 ? 'text-primary' : 'text-red-500'}`}>
                      {access.remainingAttempts}
                    </span>
                  </div>
                  <a
                    href={access.remainingAttempts > 0 ? `/practice-tests/${access.test.id}?accessId=${access.id}&subscriptionId=${dashboardData.subscription.planType}` : '#'}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all ${access.remainingAttempts > 0
                      ? 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-md cursor-pointer'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                  >
                    Démarrer
                  </a>
                </div>
              </div>
            ))}

            {dashboardData.testAccesses.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <Icon name="DocumentTextIcon" size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-foreground mb-2">Aucun test disponible</h3>
                <p className="text-muted-foreground mb-4">Vous n'avez pas d'abonnement actif contenant des tests.</p>
                <a href="/pricing-plans" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold">
                  Découvrir nos plans
                </a>
              </div>
            )}
          </div>

          {/* Derniers Résultats Section */}
          <div className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Derniers Résultats
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Test</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Statut</th>
                      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dashboardData.recentAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">
                          Aucun test complété pour le moment.
                        </td>
                      </tr>
                    ) : (
                      dashboardData.recentAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold">{attempt.tests?.name || 'Test TCF'}</span>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {new Date(attempt.started_at || attempt.start_time).toLocaleDateString('fr-CA')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${attempt.status === 'completed' || attempt.status === 'finished' ? 'bg-green-100 text-green-700' :
                              attempt.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                              {attempt.status === 'completed' || attempt.status === 'finished' ? 'Terminé' :
                                attempt.status === 'pending_review' ? 'En correction' : 'En cours'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-primary text-lg">
                              {attempt.score_total ?? 0}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SubscriptionStatus
            planName={dashboardData.subscription.planName}
            planType={dashboardData.subscription.planType as any}
            expiryDate={dashboardData.subscription.expiryDate}
            daysRemaining={dashboardData.subscription.daysRemaining}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardInteractive;