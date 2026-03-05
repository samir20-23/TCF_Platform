'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentHeader from '@/components/common/StudentHeader';
import Icon from '@/components/ui/AppIcon';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { toast } from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function UserProfilePage() {
    const { user, profile, refreshProfile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'analytics'>('profile');

    // UI State
    const [isEditing, setIsEditing] = useState(false);

    // Two-Step Verification State
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [pendingPhone, setPendingPhone] = useState('');

    // Dashboard Data
    const [testAttempts, setTestAttempts] = useState<any[]>([]);
    const [completedTestsCount, setCompletedTestsCount] = useState(0);

    const supabase = createClient();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        study_goal: '',
        target_score: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                phone: profile.phone || '',
                study_goal: profile.study_goal || '',
                target_score: profile.target_score || '',
            });
        }
    }, [profile]);

    useEffect(() => {
        const loadRealData = async () => {
            if (!user) return;
            try {
                setLoading(true);

                const { data: attempts } = await supabase
                    .from('attempts')
                    .select('*, tests(name)')
                    .eq('user_id', user.id);

                if (attempts) setTestAttempts(attempts);

                const { count } = await supabase
                    .from('attempts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('status', 'finished');

                if (count !== null) setCompletedTestsCount(count);

            } catch (error) {
                console.error('Error loading profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) loadRealData();
    }, [user, supabase]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict: Check phone change
        if (formData.phone !== profile?.phone) {
            setPendingPhone(formData.phone);
            setShowVerification(true);
            return;
        }

        if (!window.confirm("Êtes-vous sûr de vouloir mettre à jour votre profil ?")) {
            return;
        }

        await executeUpdate(formData);
    };

    const executeUpdate = async (dataToUpdate: any) => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('users')
                .update(dataToUpdate)
                .eq('id', user?.id);

            if (!error) {
                toast.success('Profil mis à jour avec succès');
                await refreshProfile();
                setIsEditing(false);
            } else {
                toast.error('Erreur lors de la mise à jour');
            }
        } catch (error) {
            toast.error('Une erreur est survenue');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyCode = async () => {
        // Mock verification logic
        if (verificationCode === '1234') { // Mock code
            setShowVerification(false);
            if (!window.confirm("Téléphone vérifié. Confirmer la mise à jour globale ?")) return;
            await executeUpdate(formData);
        } else {
            toast.error("Code incorrect (Essayez 1234)");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Chart Data Preparation
    const testProgressData = testAttempts.slice(0, 5).map((a: any) => ({
        name: a.tests?.name?.substring(0, 15) || 'Test',
        score: a.percentage || (a.score ? Math.round(a.score) : 0),
    }));

    const hasActivity = testAttempts.length > 0 || completedTestsCount > 0;

    return (
        <div className="min-h-screen bg-muted/10 pb-12">
            <StudentHeader />

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="UserIcon" size={32} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-foreground">{profile?.name}</h1>
                            <p className="text-muted-foreground font-medium">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2 mb-8 border-b border-border">
                    <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'profile' ? 'text-primary border-b-4 border-primary' : 'text-muted-foreground'}`}>Profil</button>
                    <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'analytics' ? 'text-primary border-b-4 border-primary' : 'text-muted-foreground'}`}>Analyses</button>
                </div>

                {activeTab === 'profile' ? (
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Informations Personnelles</h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-primary font-bold text-sm hover:underline"
                                >
                                    Modifier mes informations
                                </button>
                            )}
                        </div>

                        {showVerification ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                                    <h4 className="font-bold text-primary mb-2">Vérification Requise</h4>
                                    <p className="text-sm text-foreground mb-4">
                                        Vous avez modifié votre numéro de téléphone. Veuillez entrer le code envoyé au <strong>{pendingPhone}</strong>.
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Code de vérification (1234)"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none mb-3"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleVerifyCode}
                                            className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all"
                                        >
                                            Vérifier
                                        </button>
                                        <button
                                            onClick={() => setShowVerification(false)}
                                            className="px-4 py-3 text-muted-foreground font-bold hover:bg-muted rounded-xl"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Nom Complet</label>
                                    {isEditing ? (
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" required />
                                    ) : (
                                        <p className="text-lg font-medium text-foreground py-2 border-b border-transparent">{formData.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Email (Non modifiable)</label>
                                    <p className="text-lg font-medium text-muted-foreground py-2 border-b border-transparent bg-muted/20 px-3 rounded-md">{user?.email}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Téléphone</label>
                                    {isEditing ? (
                                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                                    ) : (
                                        <p className="text-lg font-medium text-foreground py-2 border-b border-transparent">{formData.phone || 'Non renseigné'}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Objectif d'étude</label>
                                        {isEditing ? (
                                            <select value={formData.study_goal} onChange={(e) => setFormData({ ...formData, study_goal: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none">
                                                <option value="">Sélectionner</option>
                                                <option value="Immigration">Immigration</option>
                                                <option value="Travail">Travail</option>
                                                <option value="Études">Études</option>
                                            </select>
                                        ) : (
                                            <p className="text-lg font-medium text-foreground py-2 border-b border-transparent">{formData.study_goal || 'Non spécifié'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Score visé (CLB)</label>
                                        {isEditing ? (
                                            <input type="text" placeholder="ex: CLB 7" value={formData.target_score} onChange={(e) => setFormData({ ...formData, target_score: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                                        ) : (
                                            <p className="text-lg font-medium text-foreground py-2 border-b border-transparent">{formData.target_score || 'Non spécifié'}</p>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-4 pt-4">
                                        <button disabled={saving} type="submit" className="flex-1 bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg">
                                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-4 font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {!hasActivity ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-3xl text-center p-8">
                                <div className="h-40 w-40 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                                    <Icon name="ChartBarIcon" size={64} className="text-muted-foreground/50" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-2">Aucune donnée disponible</h3>
                                <p className="text-muted-foreground max-w-md mb-8">
                                    Vous n'avez pas encore commencé de préparation ou passé de tests. Commencez votre apprentissage pour voir vos statistiques apparaître ici !
                                </p>
                                <Link
                                    href="/pricing-plans"
                                    className="bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-xl hover:-translate-y-1"
                                >
                                    Découvrir les plans d'étude
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold mb-6">Mes Résultats de Tests</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={testProgressData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center">
                                    <div className="text-center w-full mb-8">
                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Tests passés</p>
                                        <p className="text-5xl font-black text-foreground">{testAttempts.length}</p>
                                    </div>
                                    <div className="text-center w-full mb-8">
                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Tests complétés</p>
                                        <p className="text-5xl font-black text-success">{completedTestsCount}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
