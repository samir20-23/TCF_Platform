'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import MetricCard from './MetricCard';
import RecentActivityTable from './RecentActivityTable';
import QuickActionButton from './QuickActionButton';
import SubscriptionChart from './SubscriptionChart';
import AlertsPanel from './AlertsPanel';
import SubmissionReviewList from './SubmissionReviewList';
import AttemptsChart from './AttemptsChart';
import ScoreDistributionChart from './ScoreDistributionChart';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Activity {
  id: number;
  userName: string;
  userEmail: string;
  action: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

interface SubscriptionData {
  name: string;
  value: number;
  color: string;
}

interface Course {
  id: number;
  title: string;
  enrollments: number;
  completionRate: number;
}

interface Alert {
  id: number;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

const AdminDashboardInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [attemptsTimeSeries, setAttemptsTimeSeries] = useState<{ date: string, count: number }[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<{ range: string, count: number }[]>([]);
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    activeSubscriptions: 0,
    revenue7Days: 0,
    testsStarted: 0,
    pendingReviews: 0,
  });
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user && isHydrated) {
      loadAdminData();
    }
  }, [user, isHydrated]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active subscriptions count
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get tests pending review
      const { count: pendingReviews } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review');

      // Get tests started (in_progress)
      const { count: testsStarted } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      // Get revenue last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentPayments } = await supabase
        .from('payments')
        .select('amount_cents')
        .gte('created_at', sevenDaysAgo.toISOString());

      const revenue7Days = (recentPayments?.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0) || 0) / 100;

      // Get active users (24h)
      // For this implementation, we'll count entries in 'actions' as activity if users doesn't have last_login_at
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const { count: activeUsers24h } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', oneDayAgo.toISOString());

      // Get subscription distribution
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan_id, plans(name)')
        .eq('status', 'active');

      const subscriptionCounts: Record<string, number> = {};
      subscriptions?.forEach((sub: any) => {
        const planName = sub.plans?.name || 'Inconnu';
        subscriptionCounts[planName] = (subscriptionCounts[planName] || 0) + 1;
      });

      const subscriptionChartData: SubscriptionData[] = [
        { name: 'Bronze', value: subscriptionCounts['PLAN_BRONZE'] || subscriptionCounts['Bronze'] || 0, color: '#CD7F32' },
        { name: 'Silver', value: subscriptionCounts['PLAN_SILVER'] || subscriptionCounts['Silver'] || 0, color: '#C0C0C0' },
        { name: 'Gold', value: subscriptionCounts['PLAN_GOLD'] || subscriptionCounts['Gold'] || 0, color: '#FFD700' },
      ].filter(item => item.value > 0);

      const finalChartData = subscriptionChartData.length > 0
        ? subscriptionChartData
        : [{ name: 'Aucun abonnement', value: 1, color: '#718096' }];

      // Get recent activities (Attempts)
      const { data: recentAttempts } = await supabase
        .from('attempts')
        .select(`
          id,
          status,
          created_at,
          users:users(name, email),
          tests:tests(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const activitiesList: Activity[] = recentAttempts?.map((attempt: any) => ({
        id: attempt.id,
        userName: attempt.users?.name || 'Étudiant',
        userEmail: attempt.users?.email || '',
        action: `Complétion: ${attempt.tests?.name || 'Test'}`,
        timestamp: new Date(attempt.created_at).toLocaleString('fr-CA'),
        status: attempt.status === 'finished' ? 'success' : 'pending',
      })) || [];

      // Set alerts
      const alertsList: Alert[] = [
        {
          id: 1,
          type: 'info',
          title: 'Système opérationnel',
          message: 'Le moteur de test est prêt',
          timestamp: new Date().toLocaleString('fr-CA'),
        },
      ];

      // --- CHARTS DATA AGGREGATION ---

      // 1. Attempts Time Series (Last 14 days)
      const { data: allRecentAttempts } = await supabase
        .from('attempts')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 14).toISOString());

      const attemptsMap: Record<string, number> = {};
      // Initialize last 14 days with 0
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MMM d', { locale: fr });
        attemptsMap[d] = 0;
      }

      allRecentAttempts?.forEach((a: any) => {
        const d = format(new Date(a.created_at), 'MMM d', { locale: fr });
        if (typeof attemptsMap[d] !== 'undefined') {
          attemptsMap[d]++;
        }
      });

      const timeSeriesData = Object.entries(attemptsMap).map(([date, count]) => ({ date, count }));

      // 2. Score Distribution
      const { data: scores } = await supabase
        .from('attempts')
        .select('score_total')
        .eq('status', 'completed');

      const ranges = [
        { range: '0-20%', min: 0, max: 20 },
        { range: '21-40%', min: 21, max: 40 },
        { range: '41-60%', min: 41, max: 60 },
        { range: '61-80%', min: 61, max: 80 },
        { range: '81-100%', min: 81, max: 100 },
      ];

      const distribution = ranges.map(r => ({
        range: r.range,
        count: scores?.filter((s: any) => {
          // Assume max score is around 100 for percentage representation
          // This is a simplification; in a real app you'd divide by test.total_points
          const val = s.score_total || 0;
          return val >= r.min && val <= r.max;
        }).length || 0
      }));

      setMetrics({
        activeUsers: activeUsers24h || 0,
        activeSubscriptions: activeSubscriptions || 0,
        revenue7Days: Math.round(revenue7Days),
        testsStarted: testsStarted || 0,
        pendingReviews: pendingReviews || 0,
      });
      setActivities(activitiesList);
      setSubscriptionData(finalChartData);
      setAttemptsTimeSeries(timeSeriesData);
      setScoreDistribution(distribution);
      setAlerts(alertsList);
    } catch (error: any) {
      // Ignore AbortError noise
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated || loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Tableau de bord administrateur
          </h1>
          <p className="mt-2 font-body text-muted-foreground">
            Vue d&apos;ensemble de la plateforme TCF Canada
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Utilisateurs Actifs (24h)"
          value={metrics.activeUsers}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <MetricCard
          title="Abonnements Actifs"
          value={metrics.activeSubscriptions}
          icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
        <MetricCard
          title="Revenu (7j)"
          value={`${metrics.revenue7Days} CAD`}
          icon="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        />
        <MetricCard
          title="Tests Débutés"
          value={metrics.testsStarted}
          icon="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <MetricCard
          title="Reviews en attente"
          value={metrics.pendingReviews}
          highlight={metrics.pendingReviews > 0}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AttemptsChart data={attemptsTimeSeries} />
            <ScoreDistributionChart data={scoreDistribution} />
          </div>
          <SubmissionReviewList />
          <RecentActivityTable activities={activities} />
        </div>
        <div className="space-y-6">
          <SubscriptionChart data={subscriptionData} />
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton
          icon="UserPlusIcon"
          label="Créer Utilisateur"
          description="Nouveau compte"
          href="/admin-user-management?action=new"
        />
        <QuickActionButton
          icon="CurrencyDollarIcon"
          label="Créer Plan"
          description="Nouvelle offre"
          href="/admin-dashboard/plans?action=new"
        />
        <QuickActionButton
          icon="DocumentPlusIcon"
          label="Créer Test"
          description="Nouvel examen"
          href="/admin-content-management?action=new"
        />
        <QuickActionButton
          icon="ClipboardDocumentCheckIcon"
          label="Review Queue"
          description="Corrections manuelles"
          href="/admin-content-management?tab=reviews"
        />
      </div>
    </div>
  );
};

export default AdminDashboardInteractive;
