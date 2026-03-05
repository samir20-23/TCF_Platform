'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/common/AdminHeader';
import AdminSidebar from '@/components/common/AdminSidebar';
import Icon from '@/components/ui/AppIcon';
import toast from 'react-hot-toast';

interface Plan {
    id: string;
    name: string;
    description: string;
    price_cents: number;
    duration_days: number;
    currency: string;
    features: string[];
    is_popular: boolean;
    active: boolean;
    published?: boolean;
    attempts_allowed?: number;
    allowed_tests_tags?: string[];
    test_ids?: string[];
}

export default function AdminPlansPage() {
    const { user, profile } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
    const [availableTests, setAvailableTests] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        fetchPlans();
        fetchTests();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/admin/plans');
            const data = await res.json();
            if (res.ok) setPlans(data.plans || []);
        } catch (err) {
            toast.error('Erreur lors du chargement des plans');
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await fetch('/api/admin/tests');
            const data = await res.json();
            if (res.ok) setAvailableTests(data.tests || []);
        } catch (err) {
            console.error('Erreur lors du chargement des tests', err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingPlan?.name?.trim()) {
            toast.error('Le nom du plan est requis');
            return;
        }

        if ((editingPlan?.price_cents || 0) <= 0) {
            toast.error('Le prix doit être supérieur à 0');
            return;
        }

        if (!editingPlan?.test_ids || editingPlan.test_ids.length === 0) {
            toast.error('Vous devez sélectionner au moins un test pour ce plan');
            return;
        }

        if (!editingPlan?.description?.trim()) {
            toast.error('La description est requise');
            return;
        }

        const method = editingPlan?.id ? 'PUT' : 'POST';
        const url = editingPlan?.id ? `/api/admin/plans/${editingPlan.id}` : '/api/admin/plans';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPlan),
            });

            if (res.ok) {
                toast.success(editingPlan?.id ? 'Plan mis à jour' : 'Plan créé');
                setIsModalOpen(false);
                fetchPlans();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Erreur lors de la sauvegarde');
            }
        } catch (err) {
            toast.error('Erreur réseau');
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const res = await fetch(`/api/admin/plans/${deleteConfirmId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Action effectuée');
                fetchPlans();
            }
        } catch (err) {
            toast.error('Erreur lors de la suppression');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteConfirmId(id);
    };

    const handleClone = (plan: Plan) => {
        const { id, ...rest } = plan;
        setEditingPlan({
            ...rest,
            name: `${plan.name} (Copie)`,
            active: true,
            published: false
        });
        setIsModalOpen(true);
    };



    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AdminHeader />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 lg:ml-72 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Gestion des plans</h1>
                                <p className="text-muted-foreground">Configurez vos offres et tarifs</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingPlan({
                                        features: [],
                                        currency: 'USD',
                                        active: true,
                                        published: false,
                                        test_ids: [],
                                        attempts_allowed: 3,
                                        allowed_tests_tags: []
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all"
                            >
                                <Icon name="PlusIcon" size={20} />
                                <span>Nouveau Plan</span>
                            </button>
                        </div>

                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {plans.map((plan) => (
                                    <div key={plan.id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center group">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                                {plan.is_popular && <span className="bg-warning/20 text-warning text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Populaire</span>}
                                                {!plan.active && <span className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Archivé</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">{plan.description}</p>
                                            <div className="flex space-x-4 text-xs font-semibold text-primary">
                                                <span>{(plan.price_cents / 100).toFixed(2)} {plan.currency}</span>
                                                <span>•</span>
                                                <span>{plan.duration_days} jours</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 mt-4 md:mt-0 opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleClone(plan)}
                                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                title="Cloner"
                                            >
                                                <Icon name="DocumentDuplicateIcon" size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingPlan(plan);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                                title="Modifier"
                                            >
                                                <Icon name="PencilSquareIcon" size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, plan.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                                title="Supprimer"
                                            >
                                                <Icon name="TrashIcon" size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {plans.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Aucun plan disponible.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" style={{ margin: "0" }}>
                    <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
                            <h2 className="text-xl font-bold">{editingPlan?.id ? 'Modifier le plan' : 'Nouveau plan'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                                <Icon name="XMarkIcon" size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form id="plan-form" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Nom</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-muted border-none rounded-lg p-3 text-sm"
                                            value={editingPlan?.name || ''}
                                            onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Prix</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-muted border-none rounded-lg p-3 text-sm"
                                            value={(editingPlan?.price_cents || 0) / 100}
                                            onChange={e => setEditingPlan({ ...editingPlan, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Durée (jours)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-muted border-none rounded-lg p-3 text-sm"
                                            value={editingPlan?.duration_days || 30}
                                            onChange={e => setEditingPlan({ ...editingPlan, duration_days: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Devise</label>
                                        <select
                                            className="w-full bg-muted border-none rounded-lg p-3 text-sm"
                                            value={editingPlan?.currency || 'CAD'}
                                            onChange={e => setEditingPlan({ ...editingPlan, currency: e.target.value })}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="CAD">CAD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="MAD">MAD</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Tentatives autorisées (par test)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-muted border-none rounded-lg p-3 text-sm"
                                            value={editingPlan?.attempts_allowed || 3}
                                            onChange={e => setEditingPlan({ ...editingPlan, attempts_allowed: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold">Tags de tests (filtrage automatique)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: tcf, canada, b2 (séparés par des virgules)"
                                            className="w-full bg-muted border-none rounded-lg p-3 text-sm"
                                            value={editingPlan?.allowed_tests_tags?.join(', ') || ''}
                                            onChange={e => setEditingPlan({ ...editingPlan, allowed_tests_tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold">Description</label>
                                        <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const names = (editingPlan?.test_ids || []).map(id => availableTests.find(t => t.id === id)?.name).filter(Boolean);
                                                    setEditingPlan({
                                                        ...editingPlan,
                                                        description: names.length > 0 ? `Ce plan inclut les tests suivants :\n${names.map(n => '- ' + n).join('\n')}` : ''
                                                    });
                                                }}
                                                className="rounded-md border border-border bg-muted px-2 py-1 text-xs transition-colors hover:bg-muted/80"
                                            >
                                                Générer description
                                            </button>
                                        </label>
                                    </div>
                                    <textarea
                                        required
                                        className="w-full bg-muted border-none rounded-lg p-3 text-sm h-24"
                                        value={editingPlan?.description || ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                    />
                                </div>


                                <div className="flex items-center space-x-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-none bg-muted h-5 w-5 text-primary"
                                            checked={editingPlan?.published || false}
                                            onChange={e => setEditingPlan({ ...editingPlan, published: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold">Publié (visible)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-none bg-muted h-5 w-5 text-primary"
                                            checked={editingPlan?.active !== false}
                                            onChange={e => setEditingPlan({ ...editingPlan, active: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold">Actif (interne)</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-none bg-muted h-5 w-5 text-primary"
                                            checked={editingPlan?.is_popular || false}
                                            onChange={e => setEditingPlan({ ...editingPlan, is_popular: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold">Populaire</span>
                                    </label>
                                </div>

                                <div className="space-y-2 border-t border-border pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold">Tests Inclus</label>
                                        <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium">
                                            <input
                                                type="checkbox"
                                                className="rounded border-none bg-muted h-4 w-4 text-primary"
                                                checked={editingPlan?.test_ids?.length === availableTests.length && availableTests.length > 0}
                                                onChange={(e) => {
                                                    const newTestIds = e.target.checked ? availableTests.map(t => t.id) : [];
                                                    const isAuto = !editingPlan?.description || editingPlan?.description.startsWith('Ce plan inclut les tests suivants :');
                                                    const names = newTestIds.map(id => availableTests.find(t => t.id === id)?.name).filter(Boolean);
                                                    const newDesc = names.length > 0 ? `Ce plan inclut les tests suivants :\n${names.map(n => '- ' + n).join('\n')}` : '';

                                                    setEditingPlan({
                                                        ...editingPlan,
                                                        test_ids: newTestIds,
                                                        ...(isAuto && { description: newDesc })
                                                    });
                                                }}
                                            />
                                            <span>Tous</span>
                                        </label>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-2 bg-muted p-3 rounded-lg">
                                        {availableTests.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">Aucun test disponible.</p>
                                        ) : (
                                            availableTests.map((test) => (
                                                <label key={test.id} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-none bg-background h-4 w-4 text-primary"
                                                        checked={editingPlan?.test_ids?.includes(test.id) || false}
                                                        onChange={(e) => {
                                                            const current = editingPlan?.test_ids || [];
                                                            const newTestIds = e.target.checked
                                                                ? [...current, test.id]
                                                                : current.filter(id => id !== test.id);
                                                            const isAuto = !editingPlan?.description || editingPlan?.description.startsWith('Ce plan inclut les tests suivants :');
                                                            const names = newTestIds.map(id => availableTests.find(t => t.id === id)?.name).filter(Boolean);
                                                            const newDesc = names.length > 0 ? `Ce plan inclut les tests suivants :\n${names.map(n => '- ' + n).join('\n')}` : '';

                                                            setEditingPlan({
                                                                ...editingPlan,
                                                                test_ids: newTestIds,
                                                                ...(isAuto && { description: newDesc })
                                                            });
                                                        }}
                                                    />
                                                    <span className="text-sm">{test.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Les utilisateurs ayant acheté ce plan auront accès à ces tests.</p>
                                </div>

                            </form>
                        </div>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-border sticky bottom-0 bg-card px-6 pb-6">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl font-bold hover:bg-muted transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                form="plan-form"
                                type="submit"
                                className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-primary/90 shadow-lg transition-all"
                            >
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[3100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" style={{ margin: "0" }}>
                    <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-xl p-6 fade-in zoom-in animate-in">
                        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Confirmer la suppression</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Êtes-vous sûr de vouloir supprimer/archiver ce plan ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
