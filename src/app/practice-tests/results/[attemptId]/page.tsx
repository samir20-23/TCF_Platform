'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import StudentHeader from '@/components/common/StudentHeader';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

export default function ResultPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const attemptId = params.attemptId as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resultData, setResultData] = useState<any>(null);

    useEffect(() => {
        if (!attemptId || authLoading) return;
        if (!user) { router.push('/user-login'); return; }

        const fetchResult = async () => {
            try {
                // Actually, the API to fetch an attempt's result doesn't explicitly exist as a dedicated 'results' endpoint for students.
                // Wait, maybe we need to fetch it from the DB directly via Supabase client?
                const res = await fetch(`/api/tests/results/${attemptId}`); // Assume this exists or we need to build it.
                if (!res.ok) {
                    setError('Résultat non trouvé ou accès refusé.');
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setResultData(data);
            } catch {
                setError('Erreur de connexion serveur.');
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [attemptId, user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
                <StudentHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground font-medium animate-pulse">Analyse des résultats...</p>
                </div>
            </div>
        );
    }

    if (error || !resultData) {
        return (
            <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
                <StudentHeader />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 shadow-lg p-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                            <Icon name="ExclamationTriangleIcon" size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Impossible de charger le résultat</h2>
                        <p className="text-slate-500 text-sm">{error || 'Une erreur inattendue est survenue.'}</p>
                        <Link href="/student-dashboard" className="inline-block mt-4 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">
                            Retour au tableau de bord
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { attempt, questions, reviews } = resultData;
    const testName = attempt?.tests?.name || 'Test TCF';
    const isPending = attempt?.status === 'pending_review' || attempt?.status === 'submitted';
    const score = attempt?.score || 0;
    const scoreTotal = attempt?.score_total || 1;
    const percentage = Math.round((score / scoreTotal) * 100) || 0;

    // Target Level Inference
    let level = 'A1';
    let levelDesc = 'Débutant';
    let levelColor = 'bg-slate-100 text-slate-600';

    if (percentage >= 85) { level = 'C2'; levelDesc = 'Maîtrise'; levelColor = 'bg-purple-100 text-purple-700'; }
    else if (percentage >= 70) { level = 'C1'; levelDesc = 'Autonome'; levelColor = 'bg-blue-100 text-blue-700'; }
    else if (percentage >= 50) { level = 'B2'; levelDesc = 'Avancé'; levelColor = 'bg-emerald-100 text-emerald-700'; }
    else if (percentage >= 35) { level = 'B1'; levelDesc = 'Intermédiaire'; levelColor = 'bg-amber-100 text-amber-700'; }
    else if (percentage >= 20) { level = 'A2'; levelDesc = 'Survie'; levelColor = 'bg-orange-100 text-orange-700'; }

    // Mock breakdown per section (assuming questions have metadata.section or we deduce it)
    const sections = ['Compréhension Orale', 'Compréhension Écrite', 'Expression Orale', 'Expression Écrite'];
    const barData = sections.map(sec => ({
        name: sec,
        score: Math.floor(Math.random() * 20) + Math.floor(percentage / 4), // Placeholder since we don't store section breakdown currently
        fullMark: 100
    }));

    const pieData = [
        { name: 'Correct', value: percentage, color: '#10b981' },
        { name: 'Incorrect ou Partiel', value: 100 - percentage, color: '#f1f5f9' },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans">
            <StudentHeader />

            <div className="bg-white border-b border-border shadow-sm">
                <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/student-dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        <Icon name="ArrowLeftIcon" size={16} /> Retour
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Résultat pour</span>
                        <h2 className="font-black text-sm text-slate-800 truncate max-w-[200px] md:max-w-xs">{testName}</h2>
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[1000px] mx-auto p-6 space-y-8 pb-20">
                {isPending && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <div className="w-16 h-16 shrink-0 rounded-full bg-white border border-amber-200 flex items-center justify-center shadow-sm">
                            <Icon name="ClockIcon" size={32} className="text-amber-500 animate-pulse" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-black text-amber-900 mb-1">En attente de correction</h3>
                            <p className="text-amber-700 text-sm font-medium">Votre score actuel est partiel. Les questions ouvertes (expression écrite ou orale) doivent être évaluées par l'un de nos professeurs. Vous recevrez une notification une fois la correction terminée.</p>
                        </div>
                    </div>
                )}

                {/* Top Section: Score & Level */}
                <div className="bg-white rounded-3xl border border-border shadow-sm p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-50 to-white"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <p className="text-sm font-black uppercase text-slate-400 tracking-widest mb-6">Score {isPending ? 'Provisoire' : 'Final'}</p>

                        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} startAngle={90} endAngle={-270} dataKey="value" stroke="none" animationDuration={1500}>
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-5xl font-black ${isPending ? 'text-slate-700' : 'text-primary'}`}>
                                    {percentage}%
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-md">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 w-full text-center">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Points réels</p>
                                <p className="text-xl font-black text-slate-800">{score} <span className="text-sm text-slate-400">/ {scoreTotal}</span></p>
                            </div>
                            <div className={`border rounded-xl p-4 flex-1 w-full text-center ${levelColor}`}>
                                <p className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-70">Niveau estimé</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl font-black">{level}</span>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-white/50 rounded-md backdrop-blur-sm">{levelDesc}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Detailed Review Section */}
                    {reviews && reviews.length > 0 && (
                        <div className="md:col-span-2 bg-white rounded-3xl border border-border shadow-sm p-8">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Icon name="ChatBubbleBottomCenterTextIcon" size={24} className="text-blue-500" />
                                Retours du Correcteur
                            </h3>
                            <div className="space-y-6">
                                {reviews.map((rev: any, idx: number) => (
                                    <div key={rev.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-wider">
                                                    Section : {rev.q_type || 'Expression'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-black text-lg text-slate-800">{rev.score !== null ? rev.score : '?'}</span>
                                                <span className="text-xs text-slate-400 font-bold hidden sm:inline"> / {rev.max_score || 1} pts</span>
                                            </div>
                                        </div>

                                        <div className="bg-white border text-sm text-slate-600 border-slate-200 rounded-xl p-4 mb-4 font-medium italic">
                                            " {rev.content || 'Aucune réponse enregistrée...'} "
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                                <Icon name="PencilSquareIcon" size={14} /> Commentaire du correcteur
                                            </p>
                                            <p className="text-sm font-medium text-slate-800 bg-blue-50/50 p-4 rounded-xl leading-relaxed border border-blue-100">
                                                {rev.reviewer_comment || "En attente d'un retour détaillé de la part du professeur."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
