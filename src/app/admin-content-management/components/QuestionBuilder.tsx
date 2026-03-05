'use client';

import { useState } from 'react';

// All question types supported
const QUESTION_TYPES = [
    { value: 'singleChoice', label: 'Choix Unique (MCQ)' },
    { value: 'multipleChoice', label: 'Choix Multiple' },
    { value: 'trueFalse', label: 'Vrai / Faux' },
    { value: 'shortText', label: 'Texte Court' },
    { value: 'longText', label: 'Texte Long' },
    { value: 'fileUpload', label: 'Téléchargement de fichier' },
    { value: 'audioRecording', label: 'Expression Orale (Audio)' },
    { value: 'matching', label: 'Mise en correspondance' },
    { value: 'ordering', label: 'Ordonnancement' },
];

interface Option {
    option_text: string;
    is_correct: boolean;
    order_index: number;
    pair_id?: string;
}

interface QuestionFormData {
    type: string;
    title: string;
    prompt: string;
    points: number;
    is_required: boolean;
    time_limit_seconds: string;
    options: Option[];
    metadata: Record<string, any>;
}

const defaultForm = (): QuestionFormData => ({
    type: 'singleChoice',
    title: '',
    prompt: '',
    points: 1,
    is_required: true,
    time_limit_seconds: '',
    options: Array.from({ length: 6 }, (_, i) => ({
        option_text: '',
        is_correct: false,
        order_index: i,
    })),
    metadata: {},
});

interface QuestionBuilderProps {
    testId: string;
    existingCount: number;
    onSaved: (question: any) => void;
    onCancel: () => void;
}

export default function QuestionBuilder({ testId, existingCount, onSaved, onCancel }: QuestionBuilderProps) {
    const [form, setForm] = useState<QuestionFormData>(defaultForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const setType = (type: string) => {
        const base: QuestionFormData = { ...defaultForm(), type, title: form.title };
        if (type === 'trueFalse') {
            base.options = [
                { option_text: 'Vrai', is_correct: false, order_index: 0 },
                { option_text: 'Faux', is_correct: false, order_index: 1 },
            ];
        } else if (type === 'singleChoice' || type === 'multipleChoice') {
            base.options = Array.from({ length: 6 }, (_, i) => ({
                option_text: '',
                is_correct: false,
                order_index: i,
            }));
        } else if (type === 'matching') {
            base.options = Array.from({ length: 6 }, (_, i) => ({
                option_text: '',
                is_correct: false,
                order_index: i,
                pair_id: i < 3 ? `L${i + 1}` : `R${i - 2}`,
            }));
        } else if (type === 'ordering') {
            base.options = Array.from({ length: 4 }, (_, i) => ({
                option_text: '',
                is_correct: false,
                order_index: i,
            }));
        } else {
            base.options = [];
        }
        setForm(base);
    };

    const updateOption = (idx: number, field: keyof Option, value: any) => {
        const next = [...form.options];
        next[idx] = { ...next[idx], [field]: value };

        // For singleChoice/trueFalse: uncheck others when one is checked
        if (field === 'is_correct' && value === true) {
            if (form.type === 'singleChoice' || form.type === 'trueFalse') {
                next.forEach((o, i) => { if (i !== idx) next[i] = { ...o, is_correct: false }; });
            }
        }
        setForm(f => ({ ...f, options: next }));
    };

    const addOption = () => {
        setForm(f => ({
            ...f,
            options: [...f.options, { option_text: '', is_correct: false, order_index: f.options.length }],
        }));
    };

    const removeOption = (idx: number) => {
        setForm(f => ({
            ...f,
            options: f.options.filter((_, i) => i !== idx).map((o, i) => ({ ...o, order_index: i })),
        }));
    };

    const needsOptions = ['singleChoice', 'multipleChoice', 'trueFalse', 'matching', 'ordering'].includes(form.type);
    const needsRubric = ['longText', 'audioRecording', 'fileUpload'].includes(form.type);

    const handleSave = async () => {
        setError('');
        if (!form.prompt.trim()) { setError("L'énoncé est obligatoire."); return; }
        if (needsOptions) {
            const filled = form.options.filter(o => o.option_text.trim());
            if (form.type === 'trueFalse' && !form.options.some(o => o.is_correct)) {
                setError('Sélectionnez la bonne réponse (Vrai ou Faux).'); return;
            }
            if ((form.type === 'singleChoice') && !form.options.some(o => o.is_correct)) {
                setError('Marquez une option comme correcte.'); return;
            }
            if (filled.length < 2) { setError('Ajoutez au moins 2 options.'); return; }
        }

        setSaving(true);
        try {
            const payload = {
                type: form.type,
                title: form.title || null,
                prompt: form.prompt,
                points: form.points,
                is_required: form.is_required,
                time_limit_seconds: form.time_limit_seconds ? Number(form.time_limit_seconds) : null,
                order_index: existingCount,
                metadata: form.metadata,
                options: needsOptions
                    ? form.options.filter(o => o.option_text.trim()).map((o, i) => ({
                        option_text: o.option_text,
                        is_correct: o.is_correct,
                        order_index: i,
                        pair_id: o.pair_id || null,
                    }))
                    : undefined,
            };

            const res = await fetch(`/api/admin/tests/${testId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                onSaved(data.question);
                setForm(defaultForm());
            } else {
                const data = await res.json();
                setError(data.error || 'Erreur lors de la sauvegarde.');
            }
        } catch (e: any) {
            setError(e.message || 'Erreur réseau');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Nouvelle Question</h3>
                <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 font-bold">✕ Annuler</button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium">
                    {error}
                </div>
            )}

            {/* Row 1: Type + Points + Required */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type de question *</label>
                    <select
                        value={form.type}
                        onChange={e => setType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        {QUESTION_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Points</label>
                    <input
                        type="number"
                        min={1}
                        value={form.points}
                        onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Temps (secondes, optionnel)</label>
                    <input
                        type="number"
                        min={0}
                        value={form.time_limit_seconds}
                        onChange={e => setForm(f => ({ ...f, time_limit_seconds: e.target.value }))}
                        placeholder="Ex: 90"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Titre (optionnel)</label>
                <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Compréhension du texte..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {/* Prompt / Énoncé */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Énoncé *</label>
                <textarea
                    rows={3}
                    value={form.prompt}
                    onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                    placeholder="Écrivez la question ici..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {/* Options section — MCQ / MultipleChoice */}
            {(form.type === 'singleChoice' || form.type === 'multipleChoice') && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">
                            Options {form.type === 'singleChoice' ? '(sélectionnez la bonne réponse)' : '(sélectionnez toutes les bonnes)'}
                        </label>
                        <button onClick={addOption} className="text-xs text-blue-600 font-bold hover:underline">+ Ajouter option</button>
                    </div>
                    <div className="space-y-2">
                        {form.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <input
                                    type={form.type === 'singleChoice' ? 'radio' : 'checkbox'}
                                    name="correct_option"
                                    checked={opt.is_correct}
                                    onChange={e => updateOption(idx, 'is_correct', e.target.checked)}
                                    title="Marquer comme correcte"
                                    className="w-4 h-4 shrink-0 accent-blue-600"
                                />
                                <span className="text-xs font-bold text-gray-500 w-4 shrink-0">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <input
                                    type="text"
                                    value={opt.option_text}
                                    onChange={e => updateOption(idx, 'option_text', e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                    className={`flex-1 border rounded-lg px-3 py-2 text-sm ${opt.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                                />
                                {form.options.length > 2 && (
                                    <button onClick={() => removeOption(idx)} className="text-xs text-red-400 hover:text-red-600 font-bold shrink-0">✕</button>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                        {form.type === 'singleChoice' ? '⊙ Cochez le bouton radio pour marquer la bonne réponse' : '☑ Cochez toutes les bonnes réponses'}
                    </p>
                </div>
            )}

            {/* Vrai / Faux */}
            {form.type === 'trueFalse' && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Bonne réponse</label>
                    <div className="flex gap-4">
                        {form.options.map((opt, idx) => (
                            <label key={idx} className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${opt.is_correct ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="tf_correct"
                                    checked={opt.is_correct}
                                    onChange={() => {
                                        const next = form.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                                        setForm(f => ({ ...f, options: next }));
                                    }}
                                    className="accent-green-600"
                                />
                                {opt.option_text}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Short Text — acceptable answers */}
            {form.type === 'shortText' && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Réponses acceptables (optionnel, séparées par des virgules)</label>
                    <input
                        type="text"
                        value={(form.metadata.acceptable_answers || []).join(', ')}
                        onChange={e => setForm(f => ({
                            ...f,
                            metadata: {
                                ...f.metadata,
                                acceptable_answers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                        }))}
                        placeholder="Ex: Paris, paris, PARIS"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Laissez vide si la correction est manuelle.</p>
                </div>
            )}

            {/* Long Text */}
            {form.type === 'longText' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mots minimum</label>
                        <input
                            type="number"
                            min={0}
                            value={form.metadata.min_words || ''}
                            onChange={e => setForm(f => ({ ...f, metadata: { ...f.metadata, min_words: Number(e.target.value) } }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mots maximum</label>
                        <input
                            type="number"
                            min={0}
                            value={form.metadata.max_words || ''}
                            onChange={e => setForm(f => ({ ...f, metadata: { ...f.metadata, max_words: Number(e.target.value) } }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Exemple de réponse (pour correcteur)</label>
                        <textarea
                            rows={3}
                            value={form.metadata.sample_answer || ''}
                            onChange={e => setForm(f => ({ ...f, metadata: { ...f.metadata, sample_answer: e.target.value } }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Audio Recording */}
            {form.type === 'audioRecording' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Temps max d'enregistrement (s)</label>
                        <input
                            type="number"
                            min={10}
                            value={form.metadata.max_recording_seconds || 120}
                            onChange={e => setForm(f => ({ ...f, metadata: { ...f.metadata, max_recording_seconds: Number(e.target.value) } }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                        <input
                            type="checkbox"
                            id="allow_rerecord"
                            checked={form.metadata.allow_re_record !== false}
                            onChange={e => setForm(f => ({ ...f, metadata: { ...f.metadata, allow_re_record: e.target.checked } }))}
                            className="w-4 h-4 accent-blue-600"
                        />
                        <label htmlFor="allow_rerecord" className="text-sm font-bold text-gray-700">Permettre ré-enregistrement</label>
                    </div>
                </div>
            )}

            {/* File Upload */}
            {form.type === 'fileUpload' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Types MIME acceptés</label>
                        <input
                            type="text"
                            value={(form.metadata.allowed_types || ['application/pdf']).join(', ')}
                            onChange={e => setForm(f => ({
                                ...f,
                                metadata: { ...f.metadata, allowed_types: e.target.value.split(',').map(s => s.trim()) }
                            }))}
                            placeholder="application/pdf, .docx"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Taille max (MB)</label>
                        <input
                            type="number"
                            min={1}
                            value={form.metadata.max_size_mb || 10}
                            onChange={e => setForm(f => ({ ...f, metadata: { ...f.metadata, max_size_mb: Number(e.target.value) } }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Matching */}
            {form.type === 'matching' && (
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">
                        Paires (colonne gauche → colonne droite)
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold text-gray-500 mb-1">
                        <div className="col-span-1 text-center">#</div>
                        <div>Gauche (L)</div>
                        <div>Droite (R) correspondante</div>
                    </div>
                    {[1, 2, 3, 4].map(pairNum => {
                        const left = form.options.find(o => o.pair_id === `L${pairNum}`);
                        const right = form.options.find(o => o.pair_id === `R${pairNum}`);
                        const leftIdx = form.options.findIndex(o => o.pair_id === `L${pairNum}`);
                        const rightIdx = form.options.findIndex(o => o.pair_id === `R${pairNum}`);
                        return (
                            <div key={pairNum} className="grid grid-cols-3 gap-2 items-center">
                                <div className="col-span-1 text-center text-sm font-bold text-gray-400">{pairNum}</div>
                                <input
                                    type="text"
                                    value={left?.option_text || ''}
                                    onChange={e => {
                                        if (leftIdx >= 0) updateOption(leftIdx, 'option_text', e.target.value);
                                        else setForm(f => ({ ...f, options: [...f.options, { option_text: e.target.value, is_correct: false, order_index: f.options.length, pair_id: `L${pairNum}` }] }));
                                    }}
                                    placeholder={`Élément gauche ${pairNum}`}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                                <input
                                    type="text"
                                    value={right?.option_text || ''}
                                    onChange={e => {
                                        if (rightIdx >= 0) updateOption(rightIdx, 'option_text', e.target.value);
                                        else setForm(f => ({ ...f, options: [...f.options, { option_text: e.target.value, is_correct: false, order_index: f.options.length, pair_id: `R${pairNum}` }] }));
                                    }}
                                    placeholder={`Correspondance ${pairNum}`}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        );
                    })}
                    <p className="text-xs text-gray-400">Les paires sont corrélées par numéro (L1↔R1, L2↔R2...)</p>
                </div>
            )}

            {/* Ordering */}
            {form.type === 'ordering' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">Éléments dans l'ordre correct</label>
                        <button onClick={addOption} className="text-xs text-blue-600 font-bold hover:underline">+ Ajouter</button>
                    </div>
                    {form.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                            <input
                                type="text"
                                value={opt.option_text}
                                onChange={e => updateOption(idx, 'option_text', e.target.value)}
                                placeholder={`Étape ${idx + 1}`}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                            {form.options.length > 2 && (
                                <button onClick={() => removeOption(idx)} className="text-xs text-red-400 hover:text-red-600 font-bold">✕</button>
                            )}
                        </div>
                    ))}
                    <p className="text-xs text-gray-400">Les éléments seront mélangés pour les étudiants.</p>
                </div>
            )}

            {/* Rubric for manual review types */}
            {needsRubric && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Critères d'évaluation (rubrique)</label>
                    <textarea
                        rows={3}
                        value={form.metadata.rubric || ''}
                        onChange={e => setForm(f => ({ ...f, metadata: { ...f.metadata, rubric: e.target.value } }))}
                        placeholder="Ex: Structure 30%, Cohérence 40%, Langue 30%..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
            )}

            {/* Obligatoire toggle */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="is_required_chk"
                    checked={form.is_required}
                    onChange={e => setForm(f => ({ ...f, is_required: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="is_required_chk" className="text-sm font-bold text-gray-700">Question obligatoire</label>
            </div>

            {/* Save */}
            <div className="flex gap-3 pt-2">
                <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all">
                    Annuler
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {saving ? 'Sauvegarde...' : 'Ajouter la question'}
                </button>
            </div>
        </div>
    );
}
