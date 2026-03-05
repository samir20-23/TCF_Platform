'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentDuplicateIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import AppIcon from '@/components/ui/AppIcon';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AdminHeader from '@/components/common/AdminHeader';
import AdminSidebar from '@/components/common/AdminSidebar';
interface Option {
    id?: string;
    option_text: string;
    is_correct: boolean;
    order_index: number;
}

interface Question {
    id: string;
    type: string;
    title: string;
    prompt: string;
    points: number;
    is_required: boolean;
    time_limit_seconds: number | null;
    order_index: number;
    metadata: any;
    question_options: Option[];
}

interface QuestionManagerProps {
    testId: string;
    onClose: () => void;
}

export default function QuestionManager({ testId, onClose }: QuestionManagerProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; targetId: string | null }>({ isOpen: false, targetId: null });

    const [formData, setFormData] = useState<Partial<Question>>({
        type: 'singleChoice',
        title: '',
        prompt: '',
        points: 1,
        is_required: true,
        time_limit_seconds: null,
        question_options: [],
        metadata: {}
    });

    useEffect(() => {
        loadQuestions();
    }, [testId]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/tests/${testId}/questions`);
            const data = await res.json();
            if (data.questions) setQuestions(data.questions);
        } catch (e) {
            toast.error('Erreur lors du chargement des questions');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `/api/admin/tests/${testId}/questions/${editingId}`
                : `/api/admin/tests/${testId}/questions`;

            const res = await fetch(url, {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingId ? 'Question mise à jour' : 'Question ajoutée');
                setIsAdding(false);
                setEditingId(null);
                setFormData({ type: 'singleChoice', title: '', prompt: '', points: 1, is_required: true, question_options: [] });
                loadQuestions();
            } else {
                const error = await res.json();
                throw new Error(error.error || 'Erreur lors de la sauvegarde');
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmModal({ isOpen: true, targetId: id });
    };

    const confirmDelete = async () => {
        const id = confirmModal.targetId;
        if (!id) return;
        setConfirmModal({ isOpen: false, targetId: null });
        try {
            const res = await fetch(`/api/admin/tests/${testId}/questions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Question supprimée');
                loadQuestions();
            }
        } catch (e) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const addOption = () => {
        const newOption: Option = { option_text: '', is_correct: false, order_index: (formData.question_options?.length || 0) };
        setFormData(prev => ({
            ...prev,
            question_options: [...(prev.question_options || []), newOption]
        }));
    };

    const updateOption = (index: number, field: string, value: any) => {
        const newOptions = [...(formData.question_options || [])].map(opt => ({ ...opt }));
        newOptions[index] = { ...newOptions[index], [field]: value };

        if (field === 'is_correct' && value === true) {
            if (formData.type === 'singleChoice' || formData.type === 'trueFalse') {
                newOptions.forEach((opt, i) => { if (i !== index) opt.is_correct = false; });
            }
        }
        setFormData(prev => ({ ...prev, question_options: newOptions }));
    };

    const removeOption = (index: number) => {
        const newOptions = formData.question_options?.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, question_options: newOptions }));
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
     
<div className="flex min-h-screen flex-col bg-background">
            <AdminHeader />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 lg:ml-72 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border">
                    <div>
                        <h2 className="text-xl font-bold">Gestion des Questions</h2>
                        <p className="text-sm text-muted-foreground">ID du Test: {testId}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => { setIsAdding(true); setEditingId(null); }}
                            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-all font-medium"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Ajouter une question</span>
                        </button>
                        <button onClick={onClose} className="bg-muted px-4 py-2 rounded-lg hover:bg-muted/80 transition-all font-medium">
                            Retour
                        </button>
                    </div>
                </div>

                {isAdding || editingId ? (
                    <form onSubmit={handleSave} className="bg-card p-6 rounded-xl shadow-lg border border-border space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type de question</label>
                                <select
                                    value={formData.type}
                                    onChange={e => {
                                        const type = e.target.value;
                                        if (type === 'trueFalse') {
                                            setFormData({
                                                ...formData,
                                                type,
                                                question_options: [
                                                    { option_text: 'Vrai', is_correct: false, order_index: 0 },
                                                    { option_text: 'Faux', is_correct: false, order_index: 1 }
                                                ]
                                            });
                                        } else {
                                            setFormData({ ...formData, type });
                                        }
                                    }}
                                    className="w-full bg-background border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="singleChoice">Choix Unique (MCQ)</option>
                                    <option value="multipleChoice">Choix Multiple</option>
                                    <option value="trueFalse">Vrai / Faux</option>
                                    <option value="shortText">Texte Court</option>
                                    <option value="longText">Texte Long</option>
                                    <option value="fileUpload">Téléchargement de fichier</option>
                                    <option value="speaking">Expression Orale (Audio)</option>
                                    <option value="matching">Mise en correspondance</option>
                                    <option value="ordering">Ordonnancement</option>
                                </select>
                            </div>
                            <div className="flex items-end space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Points</label>
                                    <input
                                        type="number"
                                        value={formData.points}
                                        onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-background border border-border rounded-lg p-2.5"
                                        min="1"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 mb-3">
                                    <input
                                        type="checkbox"
                                        id="is_required"
                                        checked={formData.is_required}
                                        onChange={e => setFormData({ ...formData, is_required: e.target.checked })}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                    />
                                    <label htmlFor="is_required" className="text-sm font-medium cursor-pointer">Obligatoire</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Titre (Optionnel)</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Section A - Question 1"
                                className="w-full bg-background border border-border rounded-lg p-2.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Énoncé de la question</label>
                            <textarea
                                value={formData.prompt}
                                onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg p-2.5 min-h-[100px]"
                                placeholder="Saisissez la question ici..."
                                required
                            />
                        </div>

                        {['singleChoice', 'multipleChoice', 'trueFalse'].includes(formData.type!) && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold">Options de réponse</h3>
                                    <button type="button" onClick={addOption} className="text-primary text-sm flex items-center space-x-1 hover:underline">
                                        <PlusIcon className="w-4 h-4" />
                                        <span>Ajouter une option</span>
                                    </button>
                                </div>
                                {formData.question_options?.map((opt, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                                        <input
                                            type="checkbox"
                                            checked={opt.is_correct}
                                            onChange={e => updateOption(idx, 'is_correct', e.target.checked)}
                                            className="w-5 h-5 accent-primary cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={opt.option_text}
                                            onChange={e => updateOption(idx, 'option_text', e.target.value)}
                                            className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
                                            placeholder={`Option ${idx + 1}`}
                                            required
                                        />
                                        <button type="button" onClick={() => removeOption(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-all">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setEditingId(null); }}
                                className="bg-muted px-6 py-2 rounded-lg hover:bg-muted/80 transition-all font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-primary/90 shadow-md transition-all font-bold"
                            >
                                {editingId ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        {questions.length === 0 ? (
                            <div className="bg-card p-12 text-center rounded-xl border border-dashed border-border text-muted-foreground">
                                <AppIcon name="DocumentDuplicateIcon" className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Aucune question pour le moment.</p>
                                <button onClick={() => setIsAdding(true)} className="text-primary hover:underline mt-2">Créer votre première question</button>
                            </div>
                        ) : (
                            questions.map((q) => (
                                <div key={q.id} className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all"></div>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{q.type}</span>
                                                <span className="text-xs text-muted-foreground">{q.points} pt(s)</span>
                                            </div>
                                            <h4 className="font-bold text-lg">{q.title || "Question sans titre"}</h4>
                                            <p className="text-muted-foreground text-sm line-clamp-2">{q.prompt}</p>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => { setEditingId(q.id); setFormData(q); }}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all"
                                                title="Modifier"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {q.question_options?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {q.question_options.map((opt, i) => (
                                                <div key={i} className={`text-xs p-2 rounded flex items-center space-x-2 ${opt.is_correct ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-muted/30 text-muted-foreground'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${opt.is_correct ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                                                    <span>{opt.option_text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Supprimer la question"
                message="Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible."
                isDestructive={true}
                confirmLabel="Supprimer"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmModal({ isOpen: false, targetId: null })}
            />
        </main>
    </div>
</div>
    );
}
