'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QuestionBuilder from '../../components/QuestionBuilder';
import ResourceForm from '../../components/ResourceForm';

const QUESTION_TYPE_LABELS: Record<string, string> = {
    singleChoice: 'Choix Unique',
    multipleChoice: 'Choix Multiple',
    trueFalse: 'Vrai / Faux',
    shortText: 'Texte Court',
    longText: 'Texte Long',
    fileUpload: 'Fichier',
    audioRecording: 'Expression Orale',
    matching: 'Correspondance',
    ordering: 'Ordonnancement',
};

const RESOURCE_TYPE_LABELS: Record<string, string> = {
    audio: '🎧 Audio',
    video: '🎬 Vidéo',
    document: '📄 PDF',
    article: '🔗 Article',
};

export default function AdminTestView() {
    const params = useParams();
    const router = useRouter();
    const testId = params?.id as string | undefined;
    const isNew = !testId || testId === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
    const [showResourceForm, setShowResourceForm] = useState(false);

    const [testMeta, setTestMeta] = useState({
        name: '',
        description: '',
        test_type: 'mixed',
        duration_minutes: 60,
        total_points: 0,
        max_attempts: 3,
        published: false,
        practice_mode: false,
    });

    const [questions, setQuestions] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);

    useEffect(() => {
        if (!isNew) fetchTestData();
    }, [isNew, testId]);

    const fetchTestData = async () => {
        try {
            const res = await fetch(`/api/admin/tests/${testId}`);
            if (res.ok) {
                const data = await res.json();
                setTestMeta({
                    name: data.test.name,
                    description: data.test.description || '',
                    test_type: data.test.test_type,
                    duration_minutes: data.test.duration_minutes,
                    total_points: data.test.total_points || 0,
                    max_attempts: data.test.max_attempts || 3,
                    published: data.test.published,
                    practice_mode: data.test.practice_mode || false,
                });
                setQuestions(data.questions || []);
                setResources(data.resources || []);
            }
        } catch (error) {
            console.error('Failed to load test', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMeta = async () => {
        setSaving(true);
        try {
            const endpoint = isNew ? '/api/admin/tests' : `/api/admin/tests/${testId}`;
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testMeta),
            });
            if (res.ok) {
                const data = await res.json();
                alert('Sauvegardé avec succès !');
                if (isNew) router.push(`/admin-content-management/tests/${data.test.id}`);
            } else {
                const err = await res.json();
                alert(`Erreur: ${err.error}`);
            }
        } catch {
            alert('Erreur réseau');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuestion = async (qid: string) => {
        if (!confirm('Supprimer cette question ?')) return;
        const res = await fetch(`/api/admin/tests/${testId}/questions/${qid}`, { method: 'DELETE' });
        if (res.ok) setQuestions(q => q.filter(x => x.id !== qid));
    };

    const handleDeleteResource = async (rid: string) => {
        if (!confirm('Supprimer cette ressource ?')) return;
        const res = await fetch(`/api/admin/resources/${rid}`, { method: 'DELETE' });
        if (res.ok) setResources(r => r.filter(x => x.id !== rid));
    };

    const onQuestionSaved = (q: any) => {
        setQuestions(prev => [...prev, q]);
        setShowQuestionBuilder(false);
    };

    const onResourceSaved = (r: any) => {
        setResources(prev => [...prev, r]);
        setShowResourceForm(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto pb-32 space-y-8">
            {/* Header */}
            <div className="mb-2">
                <Link href="/admin-content-management/tests" className="text-sm text-blue-600 hover:underline">
                    ← Retour à la liste
                </Link>
                <div className="flex justify-between items-center mt-2">
                    <h1 className="text-3xl font-bold">{isNew ? 'Nouveau Test' : 'Édition du Test'}</h1>
                    <button
                        onClick={handleSaveMeta}
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>

            {/* Test Meta Form */}
            <div className="bg-white shadow rounded-2xl p-6 space-y-4 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Paramètres du Test</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nom du Test *</label>
                        <input
                            type="text"
                            value={testMeta.name}
                            onChange={e => setTestMeta({ ...testMeta, name: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Type de Test</label>
                        <select
                            value={testMeta.test_type}
                            onChange={e => setTestMeta({ ...testMeta, test_type: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="mixed">Mixte</option>
                            <option value="listening">Compréhension Orale</option>
                            <option value="reading">Compréhension Écrite</option>
                            <option value="writing">Expression Écrite</option>
                            <option value="speaking">Expression Orale</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
                        <input
                            type="number"
                            value={testMeta.duration_minutes}
                            onChange={e => setTestMeta({ ...testMeta, duration_minutes: Number(e.target.value) })}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Total des points</label>
                        <input
                            type="number"
                            value={testMeta.total_points}
                            onChange={e => setTestMeta({ ...testMeta, total_points: Number(e.target.value) })}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tentatives Max</label>
                        <input
                            type="number"
                            value={testMeta.max_attempts}
                            onChange={e => setTestMeta({ ...testMeta, max_attempts: Number(e.target.value) })}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        value={testMeta.description}
                        onChange={e => setTestMeta({ ...testMeta, description: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 h-20"
                    />
                </div>

                <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={testMeta.published}
                            onChange={e => setTestMeta({ ...testMeta, published: e.target.checked })}
                            className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm font-medium">Publier ce test</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={testMeta.practice_mode}
                            onChange={e => setTestMeta({ ...testMeta, practice_mode: e.target.checked })}
                            className="w-4 h-4 accent-green-600"
                        />
                        <span className="text-sm font-medium">Mode pratique (replays illimités, ré-enregistrement autorisé)</span>
                    </label>
                </div>
            </div>

            {/* Resources Section */}
            {!isNew && (
                <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Ressources ({resources.length})</h2>
                        {!showResourceForm && (
                            <button
                                onClick={() => setShowResourceForm(true)}
                                className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all"
                            >
                                + Ajouter une ressource
                            </button>
                        )}
                    </div>

                    {showResourceForm && (
                        <ResourceForm
                            testId={testId!}
                            testName={testMeta.name}
                            questions={questions}
                            onSaved={onResourceSaved}
                            onCancel={() => setShowResourceForm(false)}
                        />
                    )}

                    <div className="space-y-2">
                        {resources.map(r => {
                            const attachedQ = r.question_id
                                ? questions.find(q => q.id === r.question_id)
                                : null;
                            return (
                                <div key={r.id} className="flex items-center justify-between bg-muted/5 border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-base">{RESOURCE_TYPE_LABELS[r.resource_type] || r.resource_type}</span>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{r.title}</p>
                                            {attachedQ && (
                                                <p className="text-xs text-blue-600 font-medium">
                                                    Attachée à Q{(attachedQ.order_index ?? 0) + 1}
                                                </p>
                                            )}
                                            {r.transcript && (
                                                <p className="text-xs text-green-600 font-medium">✓ Transcription</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteResource(r.id)}
                                        className="text-xs text-red-500 hover:text-red-700 font-bold"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            );
                        })}
                        {resources.length === 0 && !showResourceForm && (
                            <p className="text-center text-gray-400 text-sm py-4">Aucune ressource. Cliquez sur "+ Ajouter une ressource".</p>
                        )}
                    </div>
                </div>
            )}

            {/* Questions Section */}
            {!isNew && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
                        {!showQuestionBuilder && (
                            <button
                                onClick={() => setShowQuestionBuilder(true)}
                                className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-sm"
                            >
                                + Ajouter une question
                            </button>
                        )}
                    </div>

                    {showQuestionBuilder && (
                        <QuestionBuilder
                            testId={testId!}
                            existingCount={questions.length}
                            onSaved={onQuestionSaved}
                            onCancel={() => setShowQuestionBuilder(false)}
                        />
                    )}

                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white shadow-sm rounded-2xl p-5 border-l-4 border-blue-500 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {QUESTION_TYPE_LABELS[q.type] || q.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                                        {q.is_required && <span className="text-[10px] font-bold text-red-400">* Obligatoire</span>}
                                    </div>
                                    <p className="font-medium text-gray-800 text-sm line-clamp-2">
                                        {q.prompt || q.title || '(sans énoncé)'}
                                    </p>
                                    {q.question_options?.length > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">{q.question_options.length} option(s)</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="text-xs text-red-400 hover:text-red-600 font-bold shrink-0"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                        {questions.length === 0 && !showQuestionBuilder && (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-gray-400 font-medium">Aucune question. Cliquez sur "+ Ajouter une question".</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
