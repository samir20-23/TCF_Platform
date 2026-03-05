'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

interface InstructorReviewInterfaceProps {
    submissionId: string;
    onComplete: () => void;
}

const InstructorReviewInterface = ({ submissionId, onComplete }: InstructorReviewInterfaceProps) => {
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState<number>(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isAdmin } = useAuth();

    useEffect(() => {
        if (!isAdmin) {
            alert('Accès refusé: Instructeur requis');
            onComplete();
            return;
        }
        fetchSubmission();
    }, [submissionId, isAdmin, onComplete]);

    const fetchSubmission = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/submissions?status=PENDING`);
            const data = await response.json();

            if (response.ok) {
                const found = data.submissions?.find((s: any) => s.id === submissionId);
                if (found) {
                    setSubmission(found);
                    setScore(found.score || 0);
                    setFeedback(found.feedback || '');
                } else {
                    alert('Soumission non trouvée');
                    onComplete();
                }
            }
        } catch (error) {
            console.error('Error fetching submission:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!score || score < 0 || score > (submission?.max_score || 20)) {
            alert('Veuillez entrer un score valide');
            return;
        }

        if (!feedback.trim()) {
            if (!confirm('Aucun commentaire fourni. Continuer ?')) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId,
                    score: parseFloat(score.toString()),
                    feedback: feedback.trim(),
                }),
            });

            if (response.ok) {
                alert('Révision soumise avec succès !');
                onComplete();
            } else {
                throw new Error('Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Erreur lors de la soumission de la révision');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Soumission non trouvée</p>
            </div>
        );
    }

    const lessonType = submission.lessons?.type || 'WRITING';
    const isWriting = lessonType === 'WRITING';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-academic">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-heading font-bold mb-2">
                            Révision de soumission
                        </h2>
                        <p className="text-muted-foreground">
                            {submission.lessons?.title || 'Leçon inconnue'}
                        </p>
                    </div>
                    <button
                        onClick={onComplete}
                        className="p-2 hover:bg-muted rounded-full transition-academic"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Étudiant</p>
                        <p className="font-bold">{submission.user_profiles?.full_name || submission.user_profiles?.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <p className="font-bold">{isWriting ? 'Expression Écrite' : 'Expression Orale'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Soumis le</p>
                        <p className="font-bold">{new Date(submission.submitted_at || submission.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Mots</p>
                        <p className="font-bold">{submission.word_count || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Submission Content */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-academic">
                <h3 className="font-heading font-bold mb-4 flex items-center space-x-2">
                    <Icon name={isWriting ? 'DocumentTextIcon' : 'MicrophoneIcon'} size={20} className="text-primary" />
                    <span>Contenu de la soumission</span>
                </h3>

                {isWriting ? (
                    <div className="bg-muted/30 rounded-lg p-6 border border-border">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="whitespace-pre-wrap">{submission.text || 'Aucun texte fourni'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {submission.file_url && (
                            <div className="bg-muted/30 rounded-lg p-6 border border-border">
                                <audio src={submission.file_url} controls className="w-full" />
                            </div>
                        )}
                        {submission.text && (
                            <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                <p className="text-sm text-muted-foreground mb-2">Transcription:</p>
                                <p className="whitespace-pre-wrap">{submission.text}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Review Form */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-academic">
                <h3 className="font-heading font-bold mb-4 flex items-center space-x-2">
                    <Icon name="ClipboardDocumentCheckIcon" size={20} className="text-primary" />
                    <span>Évaluation</span>
                </h3>

                <div className="space-y-6">
                    {/* Score Input */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Score (sur {submission.max_score || 20} points)
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="number"
                                min="0"
                                max={submission.max_score || 20}
                                step="0.5"
                                value={score}
                                onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                                className="w-32 px-4 py-2 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={submission.max_score || 20}
                                    step="0.5"
                                    value={score}
                                    onChange={(e) => setScore(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                {score.toFixed(1)} / {submission.max_score || 20}
                            </span>
                        </div>
                    </div>

                    {/* Feedback Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Commentaires et corrections
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Fournissez des commentaires détaillés, des corrections et des suggestions d'amélioration..."
                            className="w-full h-64 p-4 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent font-sans"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                            {feedback.length} caractères
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-border">
                        <button
                            onClick={onComplete}
                            className="px-6 py-2 rounded-md border border-border font-bold hover:bg-muted transition-academic"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || score < 0 || score > (submission.max_score || 20)}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-bold shadow-academic-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-academic"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center space-x-2">
                                    <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                                    <span>Soumission...</span>
                                </span>
                            ) : (
                                'Soumettre la révision'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorReviewInterface;
