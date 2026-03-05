'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import AdminHeader from '@/components/common/AdminHeader';
import AdminSidebar from '@/components/common/AdminSidebar';

interface Submission {
    id: string;
    q_type: 'writing' | 'speaking' | string;
    content?: string;
    media_url?: string;
    word_count?: number;
    score?: number;
    max_score: number;
    feedback?: string;
    reviewed_at?: string;
    created_at: string;
    isPending: boolean;
    studentName: string;
    studentEmail?: string;
    testName?: string;
    questionText?: string;
    rubric?: string;
    sampleAnswer?: string;
    attempt_id?: string;
    question_id?: string;
    resource?: {
        id: string;
        title: string;
        resource_type: string;
        url?: string;
        transcript?: string;
        description?: string;
    };
}

export default function ReviewerQueuePage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [scoringId, setScoringId] = useState<string | null>(null);
    const [scoreInput, setScoreInput] = useState<number | string>('');
    const [feedbackInput, setFeedbackInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const [filterStudent, setFilterStudent] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [showRubric, setShowRubric] = useState<string | null>(null);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType) params.set('type', filterType);
            if (filterStatus) params.set('status', filterStatus);
            if (filterStudent) params.set('student', filterStudent);
            if (filterDate) params.set('date', filterDate);

            const res = await fetch(`/api/admin/submissions?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions || []);
            } else {
                toast.error('Erreur lors du chargement des soumissions');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setLoading(false);
        }
    }, [filterType, filterStatus]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const submitScore = async (subId: string) => {
        const score = Number(scoreInput);
        if (isNaN(score) || score < 0) {
            toast.error('Veuillez entrer un score valide');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/submissions/${subId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score, feedback: feedbackInput }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.allReviewsComplete
                    ? '✅ Évaluation enregistrée. Toutes les corrections complètes — score final calculé!'
                    : '✅ Évaluation enregistrée.'
                );
                setScoringId(null);
                setScoreInput('');
                setFeedbackInput('');
                fetchSubmissions();
            } else {
                toast.error(data.error || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setSubmitting(false);
        }
    };

    const pending = submissions.filter(s => s.isPending);
    const completed = submissions.filter(s => !s.isPending);

    const ResourceDisplay = ({ resource }: { resource: Submission['resource'] }) => {
        if (!resource) return null;
        return (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Ressource associée :</span>
                    <span className="text-sm font-bold text-amber-900">{resource.title}</span>
                </div>

                {resource.resource_type === 'audio' && resource.url && (
                    <audio controls src={resource.url} className="w-full h-8" />
                )}

                {resource.resource_type === 'video' && resource.url && (
                    <video controls src={resource.url} className="w-full max-h-48 rounded" />
                )}

                {resource.resource_type === 'document' && resource.url && (
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                        📄 Ouvrir le PDF
                    </a>
                )}

                {resource.transcript && (
                    <div className="mt-2">
                        <p className="text-[10px] font-black text-amber-700 uppercase mb-1">Transcription :</p>
                        <p className="text-xs text-amber-800 italic leading-relaxed">{resource.transcript}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AdminHeader />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 lg:ml-72 p-6 lg:p-8">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">File d&apos;attente de correction</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Corrigez les réponses ouvertes (rédactions, expressions orales)
                            </p>
                        </div>
                        <Link href="/admin-dashboard" className="text-sm text-blue-600 hover:underline font-medium">
                            ← Tableau de bord
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Statut</label>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Tous</option>
                                <option value="pending">À corriger</option>
                                <option value="completed">Déjà corrigés</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Type</label>
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Tous les types</option>
                                <option value="writing">Rédaction (Écrit)</option>
                                <option value="speaking">Expression orale</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Étudiant</label>
                            <input
                                type="text"
                                value={filterStudent}
                                onChange={e => setFilterStudent(e.target.value)}
                                placeholder="Nom ou email..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Date</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={fetchSubmissions}
                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90"
                        >
                            🔄 Actualiser
                        </button>
                        <div className="ml-auto flex items-center gap-3">
                            <span className="text-sm text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full">
                                {pending.length} en attente
                            </span>
                            <span className="text-sm text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full">
                                {completed.length} corrigé{completed.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-400">Chargement...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">

                            {/* Pending Submissions */}
                            {(filterStatus === '' || filterStatus === 'pending') && (
                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-amber-700 flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>
                                        À Corriger ({pending.length})
                                    </h2>
                                    <div className="space-y-4">
                                        {pending.map(sub => (
                                            <div key={sub.id} className="bg-white shadow-sm rounded-xl border-l-4 border-amber-500 border border-gray-100 overflow-hidden">
                                                {/* Card Header */}
                                                <div className="p-5 flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            {sub.studentName}
                                                            <span className="text-sm font-normal text-gray-500 ml-2">
                                                                {sub.studentEmail && `(${sub.studentEmail})`}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-0.5">
                                                            {sub.testName} • Soumis le {new Date(sub.created_at).toLocaleString('fr-CA')}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${sub.q_type === 'speaking' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {sub.q_type === 'speaking' ? '🎤 Oral' : '✍️ Écrit'} • {sub.max_score} pts max
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Question + Response */}
                                                <div className="px-5 pb-5 space-y-3">
                                                    {sub.questionText && (
                                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Consigne</p>
                                                            <p className="text-sm text-gray-800 font-medium">{sub.questionText}</p>
                                                        </div>
                                                    )}

                                                    {/* Rubric toggle */}
                                                    {sub.rubric && (
                                                        <div>
                                                            <button
                                                                onClick={() => setShowRubric(showRubric === sub.id ? null : sub.id)}
                                                                className="text-xs text-blue-600 font-bold hover:underline"
                                                            >
                                                                {showRubric === sub.id ? '▲ Masquer' : '▼ Voir'} les critères d&apos;évaluation
                                                            </button>
                                                            {showRubric === sub.id && (
                                                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900 whitespace-pre-wrap">
                                                                    {sub.rubric}
                                                                    {sub.sampleAnswer && (
                                                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                                                            <p className="font-bold text-xs mb-1">Exemple de réponse :</p>
                                                                            <p className="italic">{sub.sampleAnswer}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Associated Resource */}
                                                    {sub.resource && <ResourceDisplay resource={sub.resource} />}

                                                    {/* Student Response */}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                                            Réponse de l&apos;étudiant
                                                            {sub.word_count ? <span className="text-gray-400 ml-1 normal-case">({sub.word_count} mots)</span> : null}
                                                        </p>
                                                        {sub.content && (
                                                            <div className="bg-white border border-gray-200 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                                                                {sub.content}
                                                            </div>
                                                        )}
                                                        {sub.q_type === 'speaking' && sub.media_url && (
                                                            <audio controls src={sub.media_url} className="mt-2 w-full rounded" />
                                                        )}
                                                        {!sub.content && !sub.media_url && (
                                                            <p className="text-gray-400 italic text-sm">Aucune réponse fournie.</p>
                                                        )}
                                                    </div>

                                                    {/* Scoring Panel */}
                                                    {scoringId === sub.id ? (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                                            <p className="text-sm font-bold text-blue-900">Évaluation</p>
                                                            <div className="grid grid-cols-4 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-600 mb-1">Note /{sub.max_score}</label>
                                                                    <input
                                                                        type="number"
                                                                        max={sub.max_score}
                                                                        min={0}
                                                                        step={0.5}
                                                                        value={scoreInput}
                                                                        onChange={e => setScoreInput(e.target.value)}
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <label className="block text-xs font-bold text-gray-600 mb-1">Feedback (visible par l&apos;étudiant)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={feedbackInput}
                                                                        onChange={e => setFeedbackInput(e.target.value)}
                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                                        placeholder="Très bien ! Attention à la conjugaison..."
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => submitScore(sub.id)}
                                                                    disabled={submitting}
                                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50"
                                                                >
                                                                    {submitting ? 'Enregistrement...' : '✓ Valider la note'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setScoringId(null)}
                                                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-300"
                                                                >
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setScoringId(sub.id);
                                                                setScoreInput('');
                                                                setFeedbackInput('');
                                                            }}
                                                            className="bg-primary text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-all"
                                                        >
                                                            ✏️ Corriger
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {pending.length === 0 && (
                                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                                <p className="text-4xl mb-3">🎉</p>
                                                <p className="text-gray-500 font-medium">Aucune copie en attente de correction.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Completed Submissions */}
                            {(filterStatus === '' || filterStatus === 'completed') && completed.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                                        Déjà Corrigées ({completed.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {completed.map(sub => (
                                            <div key={sub.id} className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-green-500 shadow-sm p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-gray-900">{sub.studentName}</p>
                                                    <p className="text-xs text-gray-500">{sub.testName} • {sub.q_type === 'speaking' ? 'Expression orale' : 'Rédaction'}</p>
                                                    {sub.feedback && (
                                                        <p className="text-xs text-gray-400 mt-1 italic">&ldquo;{sub.feedback}&rdquo;</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-xl text-green-600">{sub.score ?? '—'} / {sub.max_score}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {sub.reviewed_at ? new Date(sub.reviewed_at).toLocaleDateString('fr-CA') : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
