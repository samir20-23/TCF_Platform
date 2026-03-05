'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentHeader from '@/components/common/StudentHeader';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SuccessModal from '../pricing-plans/components/SuccessModal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
} from 'recharts';

export default function StudentDashboardPage() {
  const { user, loading: authLoading, role } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allowedTests, setAllowedTests] = useState<any[]>([]);
  const [allowedLoading, setAllowedLoading] = useState(true);
  const [greeting, setGreeting] = useState('Bonjour');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowSuccessModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Bon matin');
    else if (hours < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');

    const fetchData = async () => {
      try {
        setLoading(true);
        setAllowedLoading(true);
        const [dashboardRes, allowedRes] = await Promise.all([
          fetch('/api/user/dashboard'),
          fetch('/api/user/allowed-tests'),
        ]);
        if (dashboardRes.ok) {
          const json = await dashboardRes.json();
          setData(json);
        }
        if (allowedRes.ok) {
          const json = await allowedRes.json();
          setAllowedTests(json.allowedTests || []);
        } else {
          setAllowedTests([]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
        setAllowedLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  /* ── Loading skeleton ── */
  if (authLoading || (loading && !data)) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <StudentHeader />
        <main className="flex-1 w-full max-w-content mx-auto p-6 space-y-6">
          <div className="h-20 skeleton rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 skeleton rounded-xl" />
            <div className="h-72 skeleton rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  const isAdmin = role === 'admin';
  const hasActiveSubscription = isAdmin || !!(data?.subscription && data.subscription.is_active);
  const isPending = !isAdmin && data?.subscription && !data.subscription.is_active && data.subscription.status === 'pending';

  const recentAttempts = data?.recentAttempts || [];
  const performanceData = data?.performanceData || [];

  /* ── Chart data ── */
  const attemptCounts = { 'in_progress': 0, 'submitted': 0, 'pending_review': 0, 'finished': 0 };
  recentAttempts.forEach((a: any) => {
    if (a.status in attemptCounts) attemptCounts[a.status as keyof typeof attemptCounts]++;
  });

  const donutData = [
    { name: 'En cours', value: attemptCounts['in_progress'], color: '#6f4ff2' },
    { name: 'Soumis', value: attemptCounts['submitted'], color: '#9171ff' },
    { name: 'En correction', value: attemptCounts['pending_review'], color: '#f59e0b' },
    { name: 'Terminé', value: attemptCounts['finished'], color: '#16a34a' },
  ].filter(d => d.value > 0);

  const skillData = [
    { subject: 'Comp. Orale', A: Math.max(20, (data?.stats?.overall_progress || 0) - 10), fullMark: 100 },
    { subject: 'Comp. Écrite', A: Math.max(30, (data?.stats?.overall_progress || 0) + 5), fullMark: 100 },
    { subject: 'Exp. Orale', A: Math.max(15, (data?.stats?.overall_progress || 0) - 15), fullMark: 100 },
    { subject: 'Exp. Écrite', A: Math.max(25, (data?.stats?.overall_progress || 0)), fullMark: 100 },
  ];

  /* ── Status badge helper ── */
  function getStatusBadge(attempt: any, isLocked: boolean) {
    if (isLocked) return { label: 'Verrouillé', variant: 'locked' as const };
    if (!attempt) return { label: 'Non commencé', variant: 'default' as const };
    if (attempt.status === 'in_progress') return { label: 'En cours', variant: 'info' as const };
    if (attempt.status === 'submitted' || attempt.status === 'pending_review') return { label: 'En correction', variant: 'warning' as const };
    if (attempt.status === 'finished') return { label: 'Terminé', variant: 'success' as const };
    return { label: 'Non commencé', variant: 'default' as const };
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentHeader />

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          planName={data?.subscription?.plans?.name || 'Abonnement'}
        />
      )}

      <main className="flex-1 max-w-content mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-6 sm:space-y-8">

        {/* ─── Greeting ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-2xl border-4 border-white shadow-sm">
              {data?.profile?.name ? data.profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {greeting}, <span className="text-gradient">{data?.profile?.name || 'Utilisateur'}</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Continuez votre préparation et atteignez votre objectif.</p>
            </div>
          </div>
          <Link
            href="#tests"
            className="btn-primary text-sm px-5 py-2.5 rounded-xl whitespace-nowrap"
          >
            <Icon name="PlayIcon" size={16} />
            Reprendre la préparation
          </Link>
        </div>

        {/* ─── KPI Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon="ArrowTrendingUpIcon"
            iconBg="bg-primary-50"
            iconColor="text-primary"
            label="Progression"
            value={`${data?.stats?.overall_progress || 0}%`}
          />
          <KPICard
            icon="FireIcon"
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            label="Série en cours"
            value={`${data?.stats?.series_days || 0} Jours`}
          />
          <KPICard
            icon="SparklesIcon"
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            label="Points totaux"
            value={`${data?.stats?.points || 0}`}
          />
          <KPICard
            icon="AcademicCapIcon"
            iconBg="bg-green-50"
            iconColor="text-green-600"
            label="Niveau Visé"
            value={`${data?.profile?.target_score || 'B2'}`}
          />
        </div>

        {/* ─── Charts Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance chart — spans 2 cols */}
          <div className="lg:col-span-2 card">
            <h3 className="text-base font-semibold text-foreground mb-6">Performance au fil du temps</h3>
            <div className="w-full h-64">
              {performanceData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} domain={[0, 100]} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: '13px' }}
                      labelStyle={{ fontWeight: '600', color: '#0f172a' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#6f4ff2" strokeWidth={2.5} dot={{ r: 4, fill: '#6f4ff2', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} animationDuration={1200} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Icon name="ChartBarIcon" size={40} className="opacity-20" />
                  <p className="text-sm">Pas assez de données pour afficher le graphique</p>
                </div>
              )}
            </div>
          </div>

          {/* Donut & Radar column */}
          <div className="space-y-6">
            {/* Donut chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-foreground mb-4">Statut des tentatives</h3>
              <div className="w-full h-36">
                {donutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value" animationDuration={800}>
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Aucune tentative</div>
                )}
              </div>
              <div className="mt-3 space-y-1.5">
                {donutData.map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-muted-foreground">{d.name}</span></div>
                    <span className="font-semibold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-foreground mb-2">Profil de Compétences</h3>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Radar name="Score" dataKey="A" stroke="#6f4ff2" fill="#6f4ff2" fillOpacity={0.2} animationDuration={1200} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Tests & Sidebar ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8" id="tests">

          {/* Tests list — 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Mes tests assignés</h2>
              {isPending && (
                <Badge variant="warning">
                  <Icon name="ClockIcon" size={12} className="mr-1" />
                  Activation en cours...
                </Badge>
              )}
            </div>

            {allowedLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-36 skeleton rounded-xl" />)}
              </div>
            ) : allowedTests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allowedTests.map((access: any) => {
                  const isLocked = access.isExpired || access.remainingAttempts <= 0;
                  const targetHref = isLocked
                    ? '/pricing-plans'
                    : `/practice-tests/${access.test?.id}?accessId=${encodeURIComponent(access.accessId)}&subscriptionId=${encodeURIComponent(access.subscriptionId)}`;

                  const relatedAttempt = recentAttempts.find((a: any) => a.test_id === access.test?.id);
                  const status = getStatusBadge(relatedAttempt, isLocked);

                  return (
                    <div
                      key={access.accessId}
                      className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-300 ${isLocked
                        ? 'border-border/50 opacity-60 bg-muted/30'
                        : 'border-border bg-card shadow-soft hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30'
                        }`}
                    >
                      {/* Top badges */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="default">{access.test?.test_type || 'MIXTE'}</Badge>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        {access.test?.level && (
                          <Badge variant="primary">{access.test.level}</Badge>
                        )}
                      </div>

                      {/* Test info */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                          {access.test?.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {access.test?.description || "Test de préparation au TCF Canada avec questions d'entraînement."}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Icon name="ClockIcon" size={13} />{access.test?.duration_minutes || 60} min</span>
                          <span className="flex items-center gap-1"><Icon name="ArrowPathIcon" size={13} />{access.remainingAttempts} essai{access.remainingAttempts > 1 ? 's' : ''}</span>
                          {access.test?.resources?.length > 0 && (
                            <span className="flex items-center gap-1"><Icon name="PaperClipIcon" size={13} />{access.test.resources.length}</span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="pt-3 border-t border-border">
                        <Link
                          href={targetHref}
                          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-200 ${isLocked
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : relatedAttempt?.status === 'in_progress'
                              ? 'bg-primary-50 text-primary hover:bg-primary hover:text-white'
                              : 'bg-primary text-white hover:bg-primary-600'
                            }`}
                        >
                          {isLocked ? 'Expiré' : relatedAttempt?.status === 'in_progress' ? 'Reprendre' : relatedAttempt?.status === 'finished' ? 'Refaire' : 'Démarrer'}
                          {!isLocked && <Icon name="ArrowRightIcon" size={14} />}
                        </Link>
                      </div>

                      {/* Lock overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl cursor-not-allowed">
                          <Icon name="LockClosedIcon" size={28} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="card border-dashed border-2 p-10 text-center flex flex-col items-center">
                <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
                  <Icon name="FolderOpenIcon" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Aucun test débloqué</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">Vous n&apos;avez pas encore de tests assignés ou votre abonnement a expiré.</p>
                <Link href="/pricing-plans" className="btn-primary text-sm">
                  Parcourir les plans
                </Link>
              </div>
            )}
          </div>

          {/* ─── Right sidebar ─── */}
          <div className="space-y-5">
            {/* Subscription card */}
            <div className="card p-0 overflow-hidden">
              <div className="bg-muted/50 border-b border-border px-5 py-3 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-foreground">Abonnement</h3>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${hasActiveSubscription ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {hasActiveSubscription ? 'Actif' : isPending ? 'En attente' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-lg font-bold text-foreground">{data?.subscription?.plans?.name || (isAdmin ? 'Admin' : 'Aucun plan')}</p>
                {data?.subscription?.days_remaining !== undefined && (
                  <p className="text-xs text-muted-foreground">Expire dans <strong>{data.subscription.days_remaining}</strong> jours</p>
                )}
                {data?.subscription?.manual_correction === true && (
                  <Badge variant="info">Correction manuelle incluse</Badge>
                )}
                <Link href="/pricing-plans" className="block w-full text-center py-2 bg-muted hover:bg-primary-50 hover:text-primary rounded-lg text-xs font-semibold transition-colors mt-2">
                  Gérer le plan
                </Link>
              </div>
            </div>

            {/* Recent results */}
            <div className="card">
              <h3 className="text-sm font-semibold text-foreground pb-3 border-b border-border mb-3">Derniers Résultats</h3>
              <div className="space-y-2.5">
                {recentAttempts.slice(0, 4).length > 0 ? recentAttempts.slice(0, 4).map((attempt: any) => (
                  <div key={attempt.id} className="flex justify-between items-center group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors cursor-pointer">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{attempt.tests?.name}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(attempt.created_at).toLocaleDateString('fr-CA')}</p>
                    </div>
                    {attempt.status === 'in_progress' ? (
                      <Badge variant="info">En cours</Badge>
                    ) : attempt.status === 'pending_review' ? (
                      <Badge variant="warning">Correction</Badge>
                    ) : (
                      <Link href={`/practice-tests/results/${attempt.id}`} className="text-data text-sm font-bold text-primary bg-primary-50 px-2.5 py-1 rounded-lg hover:bg-primary-100 transition-colors">
                        {Math.round((attempt.score / (attempt.score_total || 1)) * 100) || 0}%
                      </Link>
                    )}
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-6">Aucune activité récente.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── KPI Card sub-component ── */
function KPICard({ icon, iconBg, iconColor, label, value }: { icon: string; iconBg: string; iconColor: string; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon name={icon as any} size={24} className={iconColor} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground text-data">{value}</p>
      </div>
    </div>
  );
}