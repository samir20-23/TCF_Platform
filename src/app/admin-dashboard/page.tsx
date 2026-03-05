'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/common/AdminHeader';
import AdminSidebar from '@/components/common/AdminSidebar';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();
        if (res.ok) setData(stats);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // 1. First, check ONLY if Auth is loading
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // 2. If Auth is done but data is loading, show the Dashboard layout immediately
  // This makes the app feel "instant"
  if (loading && !data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 lg:ml-72 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-muted rounded"></div>
              <div className="grid grid-cols-4 gap-4">
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Check permission
  if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p>Vous n'avez pas les permissions pour voir cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 lg:ml-72 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header section */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
              <p className="text-muted-foreground">Vue d'ensemble et gestion de la plateforme</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Utilisateurs</p>
                <p className="text-3xl font-bold mt-2">{data?.metrics?.totalUsers || 0}</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Abonnements</p>
                <p className="text-3xl font-bold mt-2">{data?.metrics?.activeSubscriptions || 0}</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revenu (30j)</p>
                <p className="text-3xl font-bold mt-2 text-primary">{data?.metrics?.monthlyRevenue || 0} CAD</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Taux de succès</p>
                <p className="text-3xl font-bold mt-2 text-success">85%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analytics section */}
              <div className="lg:col-span-2 space-y-8">
                {/* Popular Courses Chart */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Tests les plus populaires</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.popularTests || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="title" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} name="Tentatives" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
                    <h3 className="font-bold">Soumissions récentes</h3>
                    <Link href="/admin-submissions" className="text-xs text-primary hover:underline font-bold">Voir tout</Link>
                  </div>
                  <div className="divide-y divide-border">
                    {data?.pendingSubmissions?.length > 0 ? (
                      data.pendingSubmissions.map((sub: any) => (
                        <div key={sub.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-all">
                          <div>
                            <p className="font-bold text-sm">{sub.user_profiles?.full_name || 'Utilisateur'}</p>
                            <p className="text-xs text-muted-foreground">{sub.lessons?.title} • {new Date(sub.created_at).toLocaleDateString()}</p>
                          </div>
                          <Link href={`/admin-dashboard/submissions/${sub.id}`} className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-bold hover:bg-primary hover:text-white transition-all">
                            Réviser
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground text-sm">Aucune soumission en attente</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar stats section */}
              <div className="space-y-8">
                {/* Sub Distribution */}
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Abonnements</h3>
                  <div className="h-64">
                    {data?.subscriptionDistribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.subscriptionDistribution}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {data.subscriptionDistribution.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground bg-muted/20 rounded-lg">
                        Aucun abonnement actif
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {(data?.subscriptionDistribution || []).map((entry: any) => (
                      <div key={entry.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span>{entry.name}</span>
                        </div>
                        <span className="font-bold">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4">
                  <Link href="/admin-user-management" className="p-4 bg-card border border-border rounded-xl flex items-center space-x-4 hover:shadow-md transition-all group">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Icon name="UsersIcon" size={24} />
                    </div>
                    <span className="font-bold">Utilisateurs</span>
                  </Link>
                  <Link href="/admin-content-management" className="p-4 bg-card border border-border rounded-xl flex items-center space-x-4 hover:shadow-md transition-all group">
                    <div className="bg-success/10 p-2 rounded-lg text-success group-hover:bg-success group-hover:text-white transition-all">
                      <Icon name="DocumentPlusIcon" size={24} />
                    </div>
                    <span className="font-bold">Contenu</span>
                  </Link>
                  <Link href="#" className="p-4 bg-card border border-border rounded-xl flex items-center space-x-4 hover:shadow-md transition-all group opacity-50 cursor-not-allowed">
                    <div className="bg-warning/10 p-2 rounded-lg text-warning">
                      <Icon name="ChartBarIcon" size={24} />
                    </div>
                    <span className="font-bold">Rapports</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}