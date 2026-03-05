'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface Response {
    id: string;
    question_id: string;
    content: any;
    file_url: string | null;
    score_awarded: number;
    feedback: string | null;
    questions: {
        prompt: string;
        type: string;
        metadata: any;
        rubric: any;
    };
}

interface Attempt {
    id: string;
    status: string;
    score_total: number;
    users: { name: string; email: string };
    tests: { name: string; section_type: string };
}

interface ReviewCorrectionModalProps {
    attemptId: string;
    onClose: () => void;
    onComplete: () => void;
}

export default function ReviewCorrectionModal({ attemptId, onClose, onComplete }: ReviewCorrectionModalProps) {
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [responses, setResponses] = useState<Response[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadReviewDetail();
    }, [attemptId]);

    const loadReviewDetail = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/reviews/${attemptId}`);
            const data = await res.json();
            if (res.ok) {
                setAttempt(data.attempt);
                setResponses(data.responses || []);
            } else {
                throw new Error(data.error || 'Failed to load review');
            }
        } catch (e: any) {
            toast.error(e.message);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateResponse = async (responseId: string, score: number, feedback: string) => {
        try {
            const res = await fetch(`/api/admin/reviews/${attemptId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    responseId,
                    score_awarded: score,
                    feedback
                })
            });
            if (!res.ok) throw new Error('Failed to update response');

            setResponses(prev => prev.map(r => r.id === responseId ? { ...r, score_awarded: score, feedback } : r));
            toast.success('Réponse corrigée');
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleFinalize = async () => {
        if (!confirm('Finaliser cette correction ? Le score total sera mis à jour et l\'étudiant pourra voir son résultat.')) return;

        try {
            setIsSubmitting(true);
            // Calculate total score: auto-graded + manually graded
            const manualScore = responses.reduce((sum, r) => sum + (r.score_awarded || 0), 0);
            const totalScore = (attempt?.score_total || 0) + manualScore;

            const res = await fetch(`/api/admin/reviews/${attemptId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    finalStatus: 'completed',
                    score_total: totalScore
                })
            });

            if (res.ok) {
                toast.success('Correction finalisée !');
                onComplete();
            } else {
                throw new Error('Failed to finalize');
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
                <Icon name="ArrowPathIcon" size={48} className="animate-spin text-primary mx-auto mb-4" />
                <p className="font-bold text-lg">Chargement de la soumission...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-academic-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div>
                        <h2 className="text-2xl font-heading font-bold">Correction Manuelle</h2>
                        <p className="text-sm text-muted-foreground">
                            Étudiant : <span className="font-bold text-foreground">{attempt?.users?.name}</span> •
                            Test : <span className="font-bold text-foreground">{attempt?.tests?.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-all">
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {responses.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground italic">Aucune question nécessitant une correction manuelle n'a été trouvée pour cet essai.</p>
                        </div>
                    ) : (
                        responses.map((resp, idx) => (
                            <div key={resp.id} className="bg-muted/10 border border-border rounded-lg p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg mb-2">Question {idx + 1}</h4>
                                        <p className="text-sm font-medium text-foreground mb-4 underline decoration-primary/30 underline-offset-4">
                                            {resp.questions?.prompt}
                                        </p>
                                    </div>
                                    <div className="bg-primary/5 px-3 py-1 rounded text-[10px] font-bold text-primary uppercase border border-primary/20">
                                        {resp.questions?.type}
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-md p-4 shadow-sm">
                                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Réponse de l'étudiant</h5>
                                    {resp.file_url ? (
                                        <div className="space-y-3">
                                            <audio src={resp.file_url} controls className="w-full" />
                                            {resp.content?.transcription && (
                                                <div className="bg-muted/30 p-3 rounded text-sm italic border-l-4 border-primary">
                                                    "{resp.content.transcription}"
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{resp.content?.text || resp.content || 'Pas de texte fourni.'}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Score Awarded</label>
                                        <input
                                            type="number"
                                            value={resp.score_awarded}
                                            onChange={(e) => setResponses(prev => prev.map(r => r.id === resp.id ? { ...r, score_awarded: Number(e.target.value) } : r))}
                                            className="w-full bg-background border border-input rounded p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Commentaires / Feedback</label>
                                        <textarea
                                            value={resp.feedback || ''}
                                            onChange={(e) => setResponses(prev => prev.map(r => r.id === resp.id ? { ...r, feedback: e.target.value } : r))}
                                            className="w-full bg-background border border-input rounded p-2 text-sm h-20 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                            placeholder="Bravo, bonnes structures grammaticales..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleUpdateResponse(resp.id, resp.score_awarded, resp.feedback || '')}
                                        className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded font-bold hover:bg-primary/20 transition-all border border-primary/20"
                                    >
                                        Sauvegarder cette note
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Total score actuel : <span className="font-bold text-foreground">{(attempt?.score_total || 0) + responses.reduce((s, r) => s + (r.score_awarded || 0), 0)}</span>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={onClose} className="px-6 py-2 border border-border rounded-lg font-bold hover:bg-muted transition-all text-sm">
                            Fermer sans finaliser
                        </button>
                        <button
                            onClick={handleFinalize}
                            disabled={isSubmitting || responses.length === 0}
                            className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-bold shadow-academic hover:shadow-academic-lg hover:-translate-y-0.5 transition-all text-sm disabled:opacity-50"
                        >
                            {isSubmitting ? 'Finalisation...' : 'Finaliser la correction'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
