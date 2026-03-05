'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AdminHeader from '@/components/common/AdminHeader';
import AdminSidebar from '@/components/common/AdminSidebar';

interface Attempt {
    id: string;
    status: string;
    created_at: string;
    finished_at?: string;
    score?: number;
    score_total?: number;
    user_id: string;
    test_id: string;
    users?: { name: string; email: string };
    tests?: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
    in_progress: 'bg-blue-100 text-blue-700',
    submitted: 'bg-yellow-100 text-yellow-700',
    pending_review: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    abandoned: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
    in_progress: 'En cours',
    submitted: 'Soumis',
    pending_review: 'En attente correction',
    completed: 'Complété',
    abandoned: 'Abandonné',
};

export default function AttemptsManagementPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; action: () => void; isDestructive?: boolean }>({
        isOpen: false,
        title: '',
        message: '',
        action: () => { }
    });
    const PAGE_SIZE = 20;

    const loadAttempts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterStatus) params.set('status', filterStatus);
            if (filterSearch) params.set('search', filterSearch);
            params.set('limit', String(PAGE_SIZE));
            params.set('page', String(currentPage));

            const res = await fetch(`/api/admin/attempts?${params.toString()}`);
            if (!res.ok) throw new Error('Erreur de chargement');
            const data = await res.json();
            setAttempts(data.attempts || []);
        } catch (e: any) {
            toast.error(e.message || 'Erreur de chargement des tentatives');
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterSearch, currentPage]);

    useEffect(() => {
        loadAttempts();
    }, [loadAttempts]);

    const handleForceSubmit = async (attemptId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Force Soumettre',
            message: 'Force-soumettre cette tentative ? Cela la marquera comme soumise.',
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(attemptId);
                try {
                    const res = await fetch(`/api/admin/attempts/${attemptId}/force-submit`, { method: 'POST' });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    toast.success(`Tentative soumise — Statut: ${data.status}`);
                    loadAttempts();
                } catch (e: any) {
                    toast.error(e.message || 'Erreur lors de force-submit');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    const handleReset = async (attemptId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Réinitialiser la tentative',
            message: 'Réinitialiser cette tentative ? Les réponses seront supprimées et la tentative sera restaurée.',
            isDestructive: true,
            action: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setActionLoading(attemptId);
                try {
                    const res = await fetch(`/api/admin/attempts/${attemptId}/reset`, { method: 'POST' });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    toast.success('Tentative réinitialisée avec succès');
                    loadAttempts();
                } catch (e: any) {
                    toast.error(e.message || 'Erreur lors de la réinitialisation');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AdminHeader />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 lg:ml-72 p-6 lg:p-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Tentatives</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Inspectez, forcez la soumission ou réinitialisez les tentatives des étudiants.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Recherche (nom / email)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={filterSearch}
                                    onChange={e => setFilterSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && loadAttempts()}
                                    placeholder="Rechercher un étudiant..."
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div className="min-w-[180px]">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Statut</label>
                            <select
                                value={filterStatus}
                                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="in_progress">En cours</option>
                                <option value="submitted">Soumis</option>
                                <option value="pending_review">En attente correction</option>
                                <option value="completed">Complété</option>
                            </select>
                        </div>
                        <button
                            onClick={() => loadAttempts()}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90"
                        >
                            🔄 Actualiser
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        {loading ? (
                            <div className="p-12 text-center text-gray-400">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <p>Chargement des tentatives...</p>
                            </div>
                        ) : attempts.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <p className="font-medium">Aucune tentative trouvée.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Étudiant</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Test</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Début</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Score</th>
                                            <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attempts.map(attempt => (
                                            <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-800">{attempt.users?.name || 'Inconnu'}</p>
                                                    <p className="text-xs text-gray-400">{attempt.users?.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-800">{attempt.tests?.name || '—'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[attempt.status] || 'bg-gray-100 text-gray-700'}`}>
                                                        {STATUS_LABELS[attempt.status] || attempt.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">
                                                    {attempt.created_at ? new Date(attempt.created_at).toLocaleString('fr-CA') : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-gray-700">
                                                        {attempt.score != null ? `${attempt.score} / ${attempt.score_total || '?'}` : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedAttempt(attempt)}
                                                            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                                                        >
                                                            👁️ Inspecter
                                                        </button>
                                                        {['in_progress', 'submitted'].includes(attempt.status) && (
                                                            <button
                                                                onClick={() => handleForceSubmit(attempt.id)}
                                                                disabled={actionLoading === attempt.id}
                                                                className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                                                            >
                                                                {actionLoading === attempt.id ? '...' : 'Force Soumettre'}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleReset(attempt.id)}
                                                            disabled={actionLoading === attempt.id}
                                                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 disabled:opacity-50 transition-all"
                                                        >
                                                            {actionLoading === attempt.id ? '...' : 'Réinitialiser'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {attempts.length > 0 && (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                ← Précédent
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-600 font-medium">Page {currentPage}</span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={attempts.length < PAGE_SIZE}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                            >
                                Suivant →
                            </button>
                        </div>
                    )}

                    {/* Attempt Details Modal */}
                    {selectedAttempt && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Détails de la tentative
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            {selectedAttempt.users?.name} • {selectedAttempt.tests?.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAttempt(null)}
                                        className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 p-1.5 rounded-lg transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Body (Mock Timeline & Data) */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Statut</p>
                                            <p className="font-medium text-blue-900 mt-1">{STATUS_LABELS[selectedAttempt.status]}</p>
                                        </div>
                                        <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-purple-800 uppercase tracking-wide">Score</p>
                                            <p className="font-medium text-purple-900 mt-1">{selectedAttempt.score != null ? `${selectedAttempt.score} / ${selectedAttempt.score_total}` : 'Non calculé'}</p>
                                        </div>
                                    </div>

                                    {/* Live Timeline Mockup */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Timeline d&apos;activité</h3>
                                        <div className="space-y-4 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
                                            <div className="relative pl-8">
                                                <div className="absolute left-2 top-1.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white ring-2 ring-green-100" />
                                                <p className="text-sm font-bold text-gray-800">Test Démarré</p>
                                                <p className="text-xs text-gray-500">{new Date(selectedAttempt.created_at).toLocaleString('fr-CA')}</p>
                                            </div>
                                            <div className="relative pl-8">
                                                <div className="absolute left-2 top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white ring-2 ring-blue-100" />
                                                <p className="text-sm font-bold text-gray-800">Réponse sauvegardée (Q1)</p>
                                                <p className="text-xs text-gray-500">10 mins après démarrage</p>
                                            </div>
                                            <div className="relative pl-8">
                                                <div className="absolute left-2 top-1.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white ring-2 ring-purple-100" />
                                                <p className="text-sm font-bold text-gray-800">Audio lu (Q4) - 1/3 fois</p>
                                                <p className="text-xs text-gray-500">25 mins après démarrage</p>
                                            </div>
                                            {(selectedAttempt.status === 'completed' || selectedAttempt.status === 'submitted') && (
                                                <div className="relative pl-8">
                                                    <div className="absolute left-2 top-1.5 w-2.5 h-2.5 bg-gray-500 rounded-full border-2 border-white ring-2 ring-gray-100" />
                                                    <p className="text-sm font-bold text-gray-800">Test Soumis</p>
                                                    <p className="text-xs text-gray-500">{selectedAttempt.finished_at ? new Date(selectedAttempt.finished_at).toLocaleString('fr-CA') : 'Fin du test'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => { handleReset(selectedAttempt.id); setSelectedAttempt(null); }}
                                        className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        Réinitialiser le test
                                    </button>
                                    {['in_progress', 'submitted'].includes(selectedAttempt.status) && (
                                        <button
                                            onClick={() => { handleForceSubmit(selectedAttempt.id); setSelectedAttempt(null); }}
                                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Force Soumettre
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <ConfirmModal
                        isOpen={confirmModal.isOpen}
                        title={confirmModal.title}
                        message={confirmModal.message}
                        isDestructive={confirmModal.isDestructive}
                        onConfirm={confirmModal.action}
                        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    />
                </main>
            </div>
        </div>
    );
}
