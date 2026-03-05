'use client';

import { useState } from 'react';

const RESOURCE_TYPES = [
    { value: 'audio', label: 'Audio (écoute / oral)', accept: 'audio/mp3,audio/wav,.mp3,.wav', maxMb: 10 },
    { value: 'video', label: 'Vidéo', accept: 'video/mp4,.mp4', maxMb: 50 },
    { value: 'document', label: 'Document (PDF)', accept: 'application/pdf,.pdf', maxMb: 10 },
    { value: 'article', label: 'Article / Lien externe', accept: '', maxMb: 0 },
];

interface ResourceFormProps {
    testId: string;
    testName: string;
    questions: { id: string; prompt: string; order_index: number }[];
    onSaved: (resource: any) => void;
    onCancel: () => void;
}

export default function ResourceForm({ testId, testName, questions, onSaved, onCancel }: ResourceFormProps) {
    const [form, setForm] = useState({
        title: '',
        resource_type: 'audio',
        url: '',
        transcript: '',
        replay_limit: 3,
        description: '',
        question_id: '',
        visibility: 'public',
    });
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState('');

    const typeInfo = RESOURCE_TYPES.find(t => t.value === form.resource_type)!;
    const isFileType = ['audio', 'video', 'document'].includes(form.resource_type);
    const isArticle = form.resource_type === 'article';
    const needsTranscript = ['audio', 'video'].includes(form.resource_type);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const maxBytes = typeInfo.maxMb * 1024 * 1024;
        if (f.size > maxBytes) {
            setError(`Le fichier dépasse la limite de ${typeInfo.maxMb}MB.`);
            return;
        }
        setError('');
        setFile(f);
    };

    const handleSave = async () => {
        setError('');
        if (!form.title.trim()) { setError('Le titre est obligatoire.'); return; }
        if (isFileType && !file && !form.url) { setError('Veuillez sélectionner un fichier.'); return; }
        if (isArticle && !form.url.trim()) { setError("L'URL est obligatoire pour les articles."); return; }

        setSaving(true);
        try {
            let fileUrl = form.url;

            // Upload file if selected
            if (file) {
                setProgress('Téléchargement du fichier...');
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('testId', testId);
                uploadData.append('resourceType', form.resource_type);

                const uploadRes = await fetch('/api/storage/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!uploadRes.ok) {
                    const d = await uploadRes.json();
                    setError(d.error || 'Erreur lors du téléchargement.');
                    setSaving(false);
                    setProgress('');
                    return;
                }
                const uploadData2 = await uploadRes.json();
                fileUrl = uploadData2.url || uploadData2.publicUrl || uploadData2.path;
            }

            setProgress('Sauvegarde...');

            const payload = {
                testId,
                title: form.title,
                resourceType: form.resource_type,
                url: fileUrl || null,
                transcript: needsTranscript ? form.transcript : null,
                description: form.description || null,
                replayLimit: form.replay_limit,
                questionId: form.question_id || null,
                visibility: form.visibility,
                published: true,
            };

            const res = await fetch('/api/admin/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                onSaved(data.resource);
                // reset form
                setForm({ title: '', resource_type: 'audio', url: '', transcript: '', replay_limit: 3, description: '', question_id: '', visibility: 'public' });
                setFile(null);
            } else {
                const d = await res.json();
                setError(d.error || 'Erreur lors de la sauvegarde.');
            }
        } catch (e: any) {
            setError(e.message || 'Erreur réseau');
        } finally {
            setSaving(false);
            setProgress('');
        }
    };

    return (
        <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Ajouter une ressource</h3>
                <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 font-bold">✕</button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                <p className="text-xs font-bold text-blue-700">Test cible : {testName}</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
            {progress && <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">{progress}</div>}

            {/* Type */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Type de ressource *</label>
                <select
                    value={form.resource_type}
                    onChange={e => setForm(f => ({ ...f, resource_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                    {RESOURCE_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Titre *</label>
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Document d'écoute - extrait 1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {/* File input for audio/video/document */}
            {isFileType && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                        Fichier * — {typeInfo.accept.split(',').join(', ')} — max {typeInfo.maxMb}MB
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer relative">
                        <input
                            type="file"
                            accept={typeInfo.accept}
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {file ? (
                            <div className="text-sm font-bold text-green-700">
                                ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Glissez un fichier ou cliquez pour parcourir</p>
                        )}
                    </div>
                </div>
            )}

            {/* URL for article */}
            {isArticle && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">URL *</label>
                    <input
                        type="url"
                        value={form.url}
                        onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                        placeholder="https://..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            )}

            {/* Transcript for audio/video */}
            {needsTranscript && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Transcription / Sous-titres</label>
                    <textarea
                        rows={4}
                        value={form.transcript}
                        onChange={e => setForm(f => ({ ...f, transcript: e.target.value }))}
                        placeholder="Transcription du contenu audio/vidéo..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Obligatoire pour les tâches d'écoute (accessibilité).</p>
                </div>
            )}

            {/* Replay limit */}
            {['audio', 'video'].includes(form.resource_type) && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Limite de réécoute (mode examen)</label>
                    <input
                        type="number"
                        min={1}
                        value={form.replay_limit}
                        onChange={e => setForm(f => ({ ...f, replay_limit: Number(e.target.value) }))}
                        className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">En mode pratique, illimité. Par défaut : 3.</p>
                </div>
            )}

            {/* Attach to question */}
            {questions.length > 0 && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Attacher à une question (optionnel)</label>
                    <select
                        value={form.question_id}
                        onChange={e => setForm(f => ({ ...f, question_id: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">— Au test (visible par toutes les questions)</option>
                        {questions.map((q, i) => (
                            <option key={q.id} value={q.id}>
                                Q{(q.order_index ?? i) + 1}: {q.prompt?.slice(0, 60)}...
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Description */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description (optionnel)</label>
                <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Note pour les étudiants..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50">
                    Annuler
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? 'Sauvegarde...' : 'Ajouter la ressource'}
                </button>
            </div>
        </div>
    );
}
