'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    CheckCircleIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import Icon from '@/components/ui/AppIcon';

interface Question {
    id: string;
    type: string;
    title: string;
    prompt: string;
    points: number;
    question_options: { id: string, option_text: string }[];
}

interface TestTakingSessionProps {
    testId: string;
    initialAttempt: any;
    questions: Question[];
}

export default function TestTakingSession({ testId, initialAttempt, questions }: TestTakingSessionProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // 1. Initialize timer
        if (initialAttempt.end_time) {
            const end = new Date(initialAttempt.end_time).getTime();
            const tick = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((end - now) / 1000));
                setTimeLeft(diff);
                if (diff === 0) handleSubmit();
            };
            tick();
            const interval = setInterval(tick, 1000);
            return () => clearInterval(interval);
        }
    }, [initialAttempt.end_time]);

    useEffect(() => {
        // 2. Start autosave loop (every 10 seconds)
        autosaveTimer.current = setInterval(triggerAutosave, 10000);
        return () => {
            if (autosaveTimer.current) clearInterval(autosaveTimer.current);
        };
    }, [responses]);

    const triggerAutosave = async () => {
        try {
            const responseData = Object.entries(responses).map(([qId, content]) => ({
                question_id: qId,
                content
            }));

            if (responseData.length === 0) return;

            await fetch('/api/student/test/autosave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attemptId: initialAttempt.id, responses: responseData })
            });
        } catch (e) {
            console.error('Autosave failed:', e);
        }
    };

    const handleResponseChange = (questionId: string, content: any) => {
        setResponses(prev => ({ ...prev, [questionId]: content }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        if (timeLeft !== 0 && !confirm('Êtes-vous sûr de vouloir soumettre vos réponses ?')) return;

        try {
            setIsSubmitting(true);
            // Final autosave
            await triggerAutosave();

            const res = await fetch('/api/student/test/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attemptId: initialAttempt.id })
            });

            if (res.ok) {
                toast.success('Test soumis avec succès');
                window.location.href = '/student-dashboard';
            } else {
                throw new Error('Erreur lors de la soumission');
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentQuestion = questions[currentIdx];
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon name="AcademicCapIcon" className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="font-bold hidden md:block">Session de Test</h1>
                </div>

                <div className="flex items-center space-x-6">
                    {timeLeft !== null && (
                        <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-mono text-lg font-bold border ${timeLeft < 300 ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' : 'bg-primary/5 text-primary border-primary/20'}`}>
                            <ClockIcon className="w-5 h-5" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Soumission...' : 'Terminer'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Navigation Sidebar */}
                <aside className="w-64 border-r border-border bg-card/50 hidden lg:flex flex-col p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Questions</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIdx(idx)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border ${currentIdx === idx
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : responses[q.id]
                                            ? 'bg-success/5 text-success border-success/20'
                                            : 'bg-background text-foreground border-border hover:bg-muted'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Question Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
                    <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-sm font-medium">Question {currentIdx + 1} sur {questions.length}</span>
                            <span className="text-sm font-medium">{currentQuestion.points} Point(s)</span>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold mb-6">{currentQuestion.prompt}</h2>

                            {/* Input Widgets per Type */}
                            <div className="space-y-4">
                                {currentQuestion.type === 'singleChoice' && (
                                    <div className="space-y-3">
                                        {currentQuestion.question_options.map((opt) => (
                                            <label key={opt.id} className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer group ${responses[currentQuestion.id]?.selectedOptionIds?.[0] === opt.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name={`q-${currentQuestion.id}`}
                                                    className="hidden"
                                                    checked={responses[currentQuestion.id]?.selectedOptionIds?.[0] === opt.id}
                                                    onChange={() => handleResponseChange(currentQuestion.id, { selectedOptionIds: [opt.id] })}
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${responses[currentQuestion.id]?.selectedOptionIds?.[0] === opt.id
                                                        ? 'border-primary bg-primary'
                                                        : 'border-muted-foreground group-hover:border-primary'
                                                    }`}>
                                                    {responses[currentQuestion.id]?.selectedOptionIds?.[0] === opt.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <span className="font-medium">{opt.option_text}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {['shortText', 'longText'].includes(currentQuestion.type) && (
                                    currentQuestion.type === 'shortText' ? (
                                        <input
                                            type="text"
                                            className="w-full bg-background border-2 border-border focus:border-primary rounded-xl p-4 outline-none transition-all"
                                            placeholder="Votre réponse..."
                                            value={responses[currentQuestion.id]?.text || ''}
                                            onChange={(e) => handleResponseChange(currentQuestion.id, { text: e.target.value })}
                                        />
                                    ) : (
                                        <textarea
                                            className="w-full bg-background border-2 border-border focus:border-primary rounded-xl p-4 outline-none transition-all min-h-[200px]"
                                            placeholder="Saisissez votre réponse ici..."
                                            value={responses[currentQuestion.id]?.text || ''}
                                            onChange={(e) => handleResponseChange(currentQuestion.id, { text: e.target.value })}
                                        />
                                    )
                                )}

                                {/* More types could be implemented here */}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center pt-8">
                            <button
                                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                disabled={currentIdx === 0}
                                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-20 font-bold"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                                <span>Précédent</span>
                            </button>

                            <button
                                onClick={() => {
                                    if (currentIdx < questions.length - 1) {
                                        setCurrentIdx(prev => prev + 1);
                                    } else {
                                        handleSubmit();
                                    }
                                }}
                                className="flex items-center space-x-2 px-8 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-bold shadow-md"
                            >
                                <span>{currentIdx === questions.length - 1 ? 'Terminer' : 'Suivant'}</span>
                                {currentIdx < questions.length - 1 && <ChevronRightIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
