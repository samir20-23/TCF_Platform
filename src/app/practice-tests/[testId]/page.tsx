'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    useEffect, useState, useCallback, useRef, Suspense
} from 'react';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

// --------------- Types ---------------
interface Option {
    id: string;
    option_text: string;
    order_index: number;
    pair_id?: string | null;
}

interface Question {
    id: string;
    type: string;
    title?: string;
    prompt: string;
    points: number;
    is_required?: boolean;
    time_limit_seconds?: number | null;
    metadata?: Record<string, any>;
    options: Option[];
    resource_id?: string | null;
}

interface Resource {
    id: string;
    title: string;
    resource_type: string;
    url?: string;
    transcript?: string;
    description?: string;
    question_id?: string | null;
    is_required?: boolean;
    replay_limit?: number;
}

// --------------- Question Renderers ---------------

function SingleChoiceRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    return (
        <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt, idx) => {
                const isSelected = answer === opt.id;
                const letter = String.fromCharCode(65 + idx);
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`group w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${isSelected
                            ? 'border-primary bg-primary/5 shadow-md ring-4 ring-primary/5'
                            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 font-black text-sm transition-all duration-200 ${isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/20 bg-muted/30 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary'
                            }`}>
                            {letter}
                        </div>
                        <span className="font-medium text-base">{opt.option_text}</span>
                        {isSelected && (
                            <div className="ml-auto">
                                <Icon name="CheckCircleIcon" size={22} className="text-primary" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function MultipleChoiceRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    const selected: string[] = Array.isArray(answer) ? answer : [];
    const toggle = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(x => x !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm font-bold text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl">
                Choisissez toutes les bonnes réponses
            </p>
            {question.options.map((opt, idx) => {
                const isSelected = selected.includes(opt.id);
                const letter = String.fromCharCode(65 + idx);
                return (
                    <button
                        key={opt.id}
                        onClick={() => toggle(opt.id)}
                        className={`group w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 font-black text-sm transition-all ${isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/20 bg-muted/30 text-muted-foreground'
                            }`}>
                            {isSelected ? '✓' : letter}
                        </div>
                        <span className="font-medium text-base">{opt.option_text}</span>
                    </button>
                );
            })}
        </div>
    );
}

function TrueFalseRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    const opts = question.options.length >= 2
        ? question.options
        : [{ id: 'vrai', option_text: 'Vrai', order_index: 0 }, { id: 'faux', option_text: 'Faux', order_index: 1 }];

    return (
        <div className="grid grid-cols-2 gap-4">
            {opts.map(opt => {
                const isSelected = answer === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`p-6 rounded-2xl border-2 font-black text-xl transition-all duration-200 flex items-center justify-center gap-3 ${isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                            }`}
                    >
                        <span>{opt.option_text}</span>
                    </button>
                );
            })}
        </div>
    );
}

function ShortTextRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    const val = typeof answer === 'string' ? answer : '';
    return (
        <div className="relative group">
            <input
                type="text"
                maxLength={500}
                className="w-full p-6 bg-muted/30 border-2 border-border rounded-2xl text-lg font-medium focus:border-primary focus:bg-card focus:outline-none transition-all duration-200"
                placeholder="Tapez votre réponse ici..."
                value={val}
                onChange={e => onChange(e.target.value)}
            />
            <span className="absolute right-5 bottom-3 text-xs text-muted-foreground/50 font-bold">
                {val.length} / 500
            </span>
        </div>
    );
}

function LongTextRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    const val = typeof answer === 'string' ? answer : '';
    const wordCount = val.split(/\s+/).filter(Boolean).length;
    const minWords = question.metadata?.min_words;
    const maxWords = question.metadata?.max_words;

    return (
        <div className="space-y-3">
            <div className="relative group">
                <textarea
                    className="w-full h-72 p-6 bg-muted/30 border-2 border-border rounded-3xl text-base font-medium resize-y focus:border-primary focus:bg-card focus:outline-none transition-all duration-200 leading-relaxed"
                    placeholder="Rédigez votre réponse structurée ici..."
                    value={val}
                    onChange={e => onChange(e.target.value)}
                />
            </div>
            <div className="flex items-center justify-between px-2">
                <p className={`text-sm font-bold ${minWords && wordCount < minWords ? 'text-destructive' :
                    maxWords && wordCount > maxWords ? 'text-destructive' :
                        'text-muted-foreground'
                    }`}>
                    {wordCount} mot{wordCount !== 1 ? 's' : ''}
                    {minWords && ` (min: ${minWords})`}
                    {maxWords && ` (max: ${maxWords})`}
                </p>
                <p className="text-xs text-muted-foreground/60 font-medium flex items-center gap-1">
                    <Icon name="CloudArrowUpIcon" size={14} />
                    Sauvegarde automatique active
                </p>
            </div>
        </div>
    );
}

function FileUploadRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    const fileName = answer?.fileName || '';
    return (
        <div className="space-y-3">
            <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/40 transition-all">
                <Icon name="ArrowUpTrayIcon" size={36} className="mx-auto text-muted-foreground mb-3" />
                <p className="font-bold text-foreground mb-1">
                    {fileName || 'Glissez un fichier ou cliquez pour parcourir'}
                </p>
                <p className="text-xs text-muted-foreground">
                    {question.metadata?.allowed_types?.join(', ') || 'PDF, DOCX, etc.'} — max {question.metadata?.max_size_mb || 10}MB
                </p>
                <input
                    type="file"
                    accept={question.metadata?.allowed_types?.join(',') || '*'}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Store basic metadata for now; actual upload happens on submit
                        onChange({ fileName: file.name, fileSize: file.size, file });
                    }}
                />
            </div>
            {fileName && (
                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl">
                    <Icon name="DocumentIcon" size={20} className="text-primary" />
                    <span className="text-sm font-medium flex-1 truncate">{fileName}</span>
                    <button onClick={() => onChange(null)} className="text-xs text-destructive font-bold hover:underline">
                        Supprimer
                    </button>
                </div>
            )}
        </div>
    );
}

function AudioRecordingRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    const [recording, setRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [hasRecording, setHasRecording] = useState(!!(answer?.audioUrl || answer?.blob));
    const [audioUrl, setAudioUrl] = useState<string>(answer?.audioUrl || '');
    const mediaRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const maxSeconds = question.metadata?.max_recording_seconds || 120;
    const allowReRecord = question.metadata?.allow_re_record !== false;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            chunksRef.current = [];
            mr.ondataavailable = e => chunksRef.current.push(e.data);
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setHasRecording(true);
                onChange({ blob, audioUrl: url, duration: elapsed });
                stream.getTracks().forEach(t => t.stop());
            };
            mr.start();
            mediaRef.current = mr;
            setRecording(true);
            setElapsed(0);
            timerRef.current = setInterval(() => {
                setElapsed(p => {
                    if (p + 1 >= maxSeconds) {
                        stopRecording();
                        return p + 1;
                    }
                    return p + 1;
                });
            }, 1000);
        } catch {
            alert('Microphone non disponible. Vérifiez les autorisations.');
        }
    };

    const stopRecording = () => {
        if (mediaRef.current?.state === 'recording') mediaRef.current.stop();
        if (timerRef.current) clearInterval(timerRef.current);
        setRecording(false);
    };

    const rerecord = () => {
        setHasRecording(false);
        setAudioUrl('');
        setElapsed(0);
        onChange(null);
    };

    const formatSec = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="space-y-4">
            <div className="bg-muted/20 border border-border rounded-2xl p-6 text-center space-y-4">
                {!hasRecording ? (
                    <>
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${recording ? 'bg-destructive animate-pulse' : 'bg-muted'}`}>
                            <Icon name="MicrophoneIcon" size={36} className={recording ? 'text-white' : 'text-muted-foreground'} />
                        </div>
                        {recording && (
                            <div className="space-y-2">
                                <p className="font-mono text-2xl font-black text-destructive">{formatSec(elapsed)}</p>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="bg-destructive h-2 rounded-full transition-all" style={{ width: `${(elapsed / maxSeconds) * 100}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">Max: {formatSec(maxSeconds)}</p>
                            </div>
                        )}
                        <button
                            onClick={recording ? stopRecording : startRecording}
                            className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${recording ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:opacity-90'}`}
                        >
                            {recording ? 'Arrêter' : 'Commencer l\'enregistrement'}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                            <Icon name="CheckCircleIcon" size={36} className="text-green-600" />
                        </div>
                        <p className="font-bold text-foreground">Enregistrement terminé ({formatSec(elapsed || answer?.duration || 0)})</p>
                        {audioUrl && (
                            <audio controls src={audioUrl} className="w-full max-w-sm mx-auto" />
                        )}
                        {allowReRecord && (
                            <button onClick={rerecord} className="text-sm text-primary font-bold hover:underline">
                                Réenregistrer
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function MatchingRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    // Split options into left (pair_id 'L') and right (pair_id 'R') or use first/second halves
    const leftOpts = question.options.filter((o, i) =>
        o.pair_id?.startsWith('L') || (question.options.length % 2 === 0 && i < question.options.length / 2)
    );
    const rightOpts = question.options.filter((o, i) =>
        o.pair_id?.startsWith('R') || (question.options.length % 2 === 0 && i >= question.options.length / 2)
    );

    // answer: { leftId: rightId }
    const pairs: Record<string, string> = answer || {};
    const [selected, setSelected] = useState<string | null>(null); // selected left item

    const handleLeftClick = (id: string) => {
        setSelected(selected === id ? null : id);
    };

    const handleRightClick = (id: string) => {
        if (!selected) return;
        const next = { ...pairs, [selected]: id };
        onChange(next);
        setSelected(null);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium bg-muted/30 px-4 py-2 rounded-xl">
                Cliquez sur un élément à gauche, puis sur sa correspondance à droite
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-2">Éléments</p>
                    {leftOpts.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => handleLeftClick(opt.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left font-medium text-sm transition-all ${selected === opt.id
                                ? 'border-primary bg-primary text-primary-foreground'
                                : pairs[opt.id]
                                    ? 'border-green-400 bg-green-50 text-green-800'
                                    : 'border-border hover:border-primary/40'
                                }`}
                        >
                            {opt.option_text}
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-2">Correspondances</p>
                    {rightOpts.map(opt => {
                        const matched = Object.values(pairs).includes(opt.id);
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleRightClick(opt.id)}
                                disabled={!selected}
                                className={`w-full p-4 rounded-xl border-2 text-left font-medium text-sm transition-all ${matched
                                    ? 'border-green-400 bg-green-50 text-green-800'
                                    : selected
                                        ? 'border-dashed border-primary/60 hover:bg-primary/5 cursor-pointer'
                                        : 'border-border'
                                    }`}
                            >
                                {opt.option_text}
                            </button>
                        );
                    })}
                </div>
            </div>
            {Object.keys(pairs).length > 0 && (
                <button onClick={() => onChange({})} className="text-xs text-muted-foreground hover:text-destructive font-bold transition-colors">
                    Réinitialiser les correspondances
                </button>
            )}
        </div>
    );
}

function OrderingRenderer({ question, answer, onChange }: {
    question: Question;
    answer: any;
    onChange: (val: any) => void;
}) {
    const initialOrder = Array.isArray(answer) && answer.length === question.options.length
        ? answer
        : question.options.map(o => o.id);
    const [order, setOrder] = useState<string[]>(initialOrder);
    const dragIdx = useRef<number | null>(null);

    const optMap = Object.fromEntries(question.options.map(o => [o.id, o.option_text]));

    const onDragStart = (idx: number) => { dragIdx.current = idx; };
    const onDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx.current === null || dragIdx.current === idx) return;
        const next = [...order];
        const [moved] = next.splice(dragIdx.current, 1);
        next.splice(idx, 0, moved);
        dragIdx.current = idx;
        setOrder(next);
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium bg-muted/30 px-4 py-2 rounded-xl">
                Glissez-déposez pour ordonner les éléments
            </p>
            <div className="space-y-2">
                {order.map((id, idx) => (
                    <div
                        key={id}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={e => onDragOver(e, idx)}
                        className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-xl cursor-move hover:border-primary/40 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                            {idx + 1}
                        </div>
                        <Icon name="Bars3Icon" size={18} className="text-muted-foreground shrink-0" />
                        <span className="font-medium text-base flex-1">{optMap[id]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --------------- Resource Panel ---------------
function ResourcePanel({ resource }: { resource: Resource }) {
    const [showTranscript, setShowTranscript] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const { resource_type, title, url, transcript, description, is_required, replay_limit } = resource;

    const limit = replay_limit || 3;
    const isLimitReached = (resource_type === 'audio' || resource_type === 'video') && playCount >= limit;

    const handlePlay = () => {
        if (!isLimitReached) {
            setPlayCount(prev => prev + 1);
        }
    };

    return (
        <div className={`bg-muted/20 border rounded-xl p-4 space-y-3 ${is_required ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon name={
                        resource_type === 'audio' ? 'MusicalNoteIcon' :
                            resource_type === 'video' ? 'VideoCameraIcon' :
                                resource_type === 'document' ? 'DocumentTextIcon' :
                                    'LinkIcon'
                    } size={16} className="text-primary" />
                    <p className="font-bold text-sm">{title}</p>
                </div>
                {is_required && (
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Obligatoire
                    </span>
                )}
            </div>

            {(resource_type === 'audio' || resource_type === 'video') && (
                <div className="flex items-center justify-between px-1">
                    <p className={`text-[10px] font-bold uppercase transition-colors ${isLimitReached ? 'text-destructive' : 'text-muted-foreground'}`}>
                        Lectures: {playCount} / {limit}
                    </p>
                    {isLimitReached && (
                        <p className="text-[10px] text-destructive font-black uppercase flex items-center gap-1">
                            <Icon name="LockClosedIcon" size={10} />
                            Limite atteinte
                        </p>
                    )}
                </div>
            )}

            {resource_type === 'audio' && url && (
                <div className="relative">
                    <audio
                        controls
                        className="w-full"
                        src={url}
                        preload="metadata"
                        onPlay={handlePlay}
                        controlsList={isLimitReached ? "nodownload noplaybackrate" : "nodownload"}
                    >
                        Votre navigateur ne supporte pas l&apos;audio.
                    </audio>
                    {isLimitReached && (
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded flex items-center justify-center cursor-not-allowed z-10" />
                    )}
                </div>
            )}
            {resource_type === 'video' && url && (
                <div className="relative">
                    <video
                        controls
                        className="w-full rounded-lg max-h-48"
                        src={url}
                        preload="metadata"
                        onPlay={handlePlay}
                    >
                        Votre navigateur ne supporte pas la vidéo.
                    </video>
                    {isLimitReached && (
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded-lg flex items-center justify-center cursor-not-allowed z-10" />
                    )}
                </div>
            )}
            {resource_type === 'document' && url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline text-sm font-bold"
                >
                    <Icon name="ArrowTopRightOnSquareIcon" size={14} />
                    Ouvrir le document (PDF)
                </a>
            )}
            {resource_type === 'article' && url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline text-sm font-bold"
                >
                    <Icon name="ArrowTopRightOnSquareIcon" size={14} />
                    Ouvrir le lien
                </a>
            )}

            {transcript && (
                <div>
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <Icon name={showTranscript ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={12} />
                        {showTranscript ? 'Masquer' : 'Afficher'} la transcription
                    </button>
                    {showTranscript && (
                        <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm leading-relaxed text-foreground/80 font-medium">
                            {transcript}
                        </div>
                    )}
                </div>
            )}
            {description && !transcript && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
}

// --------------- Main ExamEngine ---------------
function ExamEngine() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const testId = params.testId as string;
    const accessId = searchParams.get('accessId') || '';
    const subscriptionId = searchParams.get('subscriptionId') || '';

    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [endAt, setEndAt] = useState<number | null>(null); // ms timestamp
    const [timeLeft, setTimeLeft] = useState(0);
    const [started, setStarted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showResources, setShowResources] = useState(false);
    const [acknowledgedResources, setAcknowledgedResources] = useState(false);
    const [flagged, setFlagged] = useState<Record<string, boolean>>({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const submittingRef = useRef(false);

    // Fetch test data (no correct answers)
    useEffect(() => {
        if (!testId || authLoading) return;
        if (!user) { router.push('/user-login'); return; }

        const fetchTest = async () => {
            try {
                const res = await fetch(`/api/tests/${testId}`);
                if (!res.ok) {
                    const d = await res.json();
                    setError(d.error || 'Impossible de charger le test');
                    return;
                }
                const data = await res.json();
                setTest(data.test);
                setQuestions(data.questions || []);
                setResources(data.resources || []);
                setTimeLeft((data.test?.duration_minutes || 60) * 60);
            } catch {
                setError('Erreur de connexion');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId, user, authLoading, router]);

    // Server-driven countdown — recalcs every second from server endAt
    useEffect(() => {
        if (!started || !endAt) return;

        const tick = () => {
            const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0 && !submittingRef.current) {
                clearInterval(timerRef.current!);
                handleSubmit(true);
            }
        };

        tick(); // immediate
        timerRef.current = setInterval(tick, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [started, endAt]);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const startExam = async () => {
        try {
            const res = await fetch(`/api/tests/${testId}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessId, subscriptionId }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erreur lors du démarrage');
                return;
            }

            setAttemptId(data.attemptId);
            setSessionToken(data.sessionToken);

            // Use server endAt as source of truth for timer
            const serverEndAt = new Date(data.endAt).getTime();
            setEndAt(serverEndAt);

            // Questions returned by start endpoint (without is_correct)
            if (data.questions?.length) {
                setQuestions(data.questions.map((q: any) => ({
                    ...q,
                    // normalize options array (start endpoint returns options key)
                    options: (q.options || []).map((o: any) => ({
                        ...o,
                        option_text: o.option_text || o.text || ''
                    }))
                })));
            }
        } catch {
            setError('Erreur de connexion');
            return;
        }
        setStarted(true);
    };

    // Autosave loop: sends current answers every 10 seconds
    useEffect(() => {
        if (!started || !attemptId || !sessionToken || submitting) return;

        const saveLoop = setInterval(async () => {
            if (submittingRef.current) return;
            try {
                const res = await fetch(`/api/tests/${testId}/autosave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attemptId, sessionToken, answerData: answers })
                });
                if (res.status === 401) {
                    setError('Session active dans un autre onglet.');
                    clearInterval(saveLoop);
                } else if (res.status === 410) {
                    clearInterval(saveLoop);
                    if (!submittingRef.current) handleSubmit(true);
                } else if (res.ok) {
                    setLastSaved(new Date());
                }
            } catch (e) {
                console.error('Autosave failed', e);
            }
        }, 10000);

        return () => clearInterval(saveLoop);
    }, [started, attemptId, sessionToken, answers, submitting]);

    const handleSubmit = useCallback(async (isAutoSubmit = false) => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const res = await fetch(`/api/tests/${testId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attemptId,
                    sessionToken,
                    answerData: answers,
                    autoSubmit: isAutoSubmit
                }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ success: false, error: 'Erreur lors de la soumission' });
        }
    }, [answers, attemptId, sessionToken, testId]);

    const setAnswer = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    // Loading
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground font-medium">Chargement du test...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-card rounded-2xl border border-destructive/20 p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                        <Icon name="ExclamationTriangleIcon" size={32} className="text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Accès refusé</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Link href="/student-dashboard" className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all">
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        );
    }

    // Results
    if (result) {
        const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : null;
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
                <div className="relative max-w-lg w-full bg-card rounded-3xl border border-border shadow-2xl p-10 text-center space-y-6 overflow-hidden">

                    <aside className="absolute inset-0 opacity-10 pointer-events-none">
                        <article style={{ "--color": "#ff6347", "--i": "12px", "--d": "1.4s" } as React.CSSProperties} className="ball"></article>
                        <article style={{ "--color": "#00ced1", "--i": "18px", "--d": "6.1s" } as React.CSSProperties} className="ball"></article>
                        <article style={{ "--color": "#adff2f", "--i": "10px", "--d": "1.9s" } as React.CSSProperties} className="ball"></article>
                        <article style={{ "--color": "#9370db", "--i": "16px", "--d": "7.8s" } as React.CSSProperties} className="ball"></article>
                        <article style={{ "--color": "#ff1493", "--i": "14px", "--d": "4.6s" } as React.CSSProperties} className="ball"></article>
                        <article style={{ "--color": "#00bfff", "--i": "11px", "--d": "1.3s" } as React.CSSProperties} className="ball"></article>
                        <article style={{ "--color": "#7fff00", "--i": "17px", "--d": "5.5s" } as React.CSSProperties} className="ball"></article>
                        <article style={{ "--color": "#dc143c", "--i": "13px", "--d": "6.7s" } as React.CSSProperties} className="ball"></article>
                    </aside>

                    <div className="relative z-10 w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                        <Icon name="CheckCircleIcon" size={48} className="text-green-600" />
                    </div>

                    <h1 className="relative z-10 text-3xl font-black text-foreground">Test Terminé !</h1>

                    {result.score !== undefined && result.score !== null && (
                        <div className="relative z-10 space-y-2">
                            {result.score === 0 ? (
                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                                    Pending validation admin
                                </p>
                            ) : (
                                <>
                                    <p className="text-6xl font-black text-primary">{result.score}</p>
                                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
                                        sur {result.maxScore} points {pct !== null ? `(${pct}%)` : ''}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {result.hasPendingReview && (
                        <div className="relative z-10 bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800 font-medium">
                                ✍️ Ce test contient des questions ouvertes. Votre score final sera disponible après correction manuelle par un correcteur.
                            </p>
                        </div>
                    )}

                    <Link href="/student-dashboard" className="relative z-10 inline-block w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                        Retour au tableau de bord
                    </Link>

                </div>

                <style jsx>{`
        .ball {
          position: absolute;
          width: calc(300px + var(--i));
          height: calc(300px + var(--i));
          background: var(--color);
          border-radius: 50%;
          animation: move linear infinite;
          transform-origin: 150px;
          animation-duration: var(--d);
          filter: blur(58px);
          mix-blend-mode: hard-light;
        }

        .ball:nth-child(even) {
          animation-direction: reverse;
        }

        @keyframes move {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

            </div>
        );
    }

    // Pre-start
    if (!started) {
        const testResources = resources.filter(r => !r.question_id);
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
                    <div className="bg-primary p-8 text-center text-primary-foreground">
                        <h1 className="text-3xl font-black">{test?.name}</h1>
                        {test?.description && <p className="mt-2 opacity-80 font-medium">{test.description}</p>}
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                                <Icon name="DocumentTextIcon" size={24} className="mx-auto text-primary mb-1" />
                                <p className="text-2xl font-black text-foreground">{questions.length}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Questions</p>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                                <Icon name="ClockIcon" size={24} className="mx-auto text-primary mb-1" />
                                <p className="text-2xl font-black text-foreground">{test?.duration_minutes || 60}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Minutes</p>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4 text-center">
                                <Icon name="AcademicCapIcon" size={24} className="mx-auto text-primary mb-1" />
                                <p className="text-xl font-black text-foreground">{test?.test_type || 'TCF'}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Type</p>
                            </div>
                        </div>

                        {testResources.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                        <Icon name="InformationCircleIcon" size={18} />
                                        Ressources du test
                                    </h3>
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                                        {testResources.length} ressource{testResources.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {testResources.map(r => (
                                        <div key={r.id} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <Icon name={r.resource_type === 'audio' ? 'SpeakerWaveIcon' : r.resource_type === 'video' ? 'PlayCircleIcon' : 'DocumentTextIcon'} size={14} className="text-blue-600" />
                                                <span className="text-xs font-bold text-blue-800">{r.title}</span>
                                            </div>
                                            {r.is_required && (
                                                <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Obligatoire</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {testResources.some(r => r.is_required) && (
                                    <div className="pt-2 border-t border-blue-200 flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="ack-res"
                                            checked={acknowledgedResources}
                                            onChange={e => setAcknowledgedResources(e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-blue-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="ack-res" className="text-xs font-medium text-blue-800 leading-tight">
                                            Je confirme avoir consulté les ressources obligatoires pour ce test.
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800 font-medium">
                                <strong>Important :</strong> Une fois commencé, le chronomètre ne peut pas être mis en pause.
                                Le test sera automatiquement soumis à la fin du temps imparti.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/student-dashboard" className="flex-1 py-4 text-center border border-border rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all">
                                Annuler
                            </Link>
                            <button
                                onClick={startExam}
                                disabled={testResources.some(r => r.is_required) && !acknowledgedResources}
                                className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
                            >
                                Commencer le test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Active exam
    const question = questions[currentQ];
    const progress = questions.length > 0 ? Math.round(((currentQ + 1) / questions.length) * 100) : 0;
    const answeredCount = Object.keys(answers).filter(k => {
        const v = answers[k];
        if (v === null || v === undefined || v === '') return false;
        if (Array.isArray(v) && v.length === 0) return false;
        if (typeof v === 'object' && Object.keys(v).length === 0) return false;
        return true;
    }).length;
    const isUrgent = timeLeft < 60;

    // Resources for this question
    const questionResources = resources.filter(r => r.question_id === question?.id);
    const testLevelResources = resources.filter(r => !r.question_id);

    const renderQuestionInput = () => {
        if (!question) return null;
        const answer = answers[question.id];
        const qtype = question.type || '';

        if (qtype === 'singleChoice' || qtype === 'mcq' || qtype === 'single_choice') {
            return <SingleChoiceRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'multipleChoice' || qtype === 'multiple_choice' || qtype === 'multi_select') {
            return <MultipleChoiceRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'trueFalse' || qtype === 'true_false') {
            return <TrueFalseRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'shortText' || qtype === 'short_text') {
            return <ShortTextRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'longText' || qtype === 'long_text' || qtype === 'writing') {
            return <LongTextRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'fileUpload' || qtype === 'file_upload') {
            return <FileUploadRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'audioRecording' || qtype === 'speaking' || qtype === 'expression_orale') {
            return <AudioRecordingRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'matching' || qtype === 'mise_en_correspondance') {
            return <MatchingRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }
        if (qtype === 'ordering' || qtype === 'ordonnancement') {
            return <OrderingRenderer question={question} answer={answer} onChange={v => setAnswer(question.id, v)} />;
        }

        return (
            <div className="bg-muted/20 rounded-xl p-6 text-center text-muted-foreground font-medium">
                Type de question non reconnu : <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">{qtype}</code>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans">
            {/* Top bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/student-dashboard" className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Quitter">
                            <Icon name="XMarkIcon" size={20} />
                        </Link>
                        <div className="h-6 w-px bg-border"></div>
                        <h2 className="font-black text-sm text-foreground hidden md:block uppercase tracking-wide">{test?.name}</h2>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md border border-primary/20">
                            {currentQ + 1} / {questions.length}
                        </span>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 font-mono text-lg font-black transition-colors ${isUrgent ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        <Icon name="ClockIcon" size={18} className={isUrgent ? "text-red-500" : "text-slate-400"} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-slate-100">
                    <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="flex-1 max-w-[1400px] mx-auto w-full p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-start">

                {/* LEFT PANEL: Question Navigation Grid */}
                <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-[88px] space-y-4">
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Navigation</h3>
                        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-5 gap-2">
                            {questions.map((q, i) => {
                                const ans = answers[q.id];
                                const isAnswered = ans !== undefined && ans !== null && ans !== '' &&
                                    !(Array.isArray(ans) && ans.length === 0) &&
                                    !(typeof ans === 'object' && !Array.isArray(ans) && Object.keys(ans).length === 0);
                                const isFlagged = flagged[q.id];

                                let btnClass = 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'; // Default: Unanswered
                                if (i === currentQ) btnClass = 'bg-primary text-white border border-primary shadow-sm hover:opacity-90 ring-2 ring-primary/20 ring-offset-1';
                                else if (isFlagged) btnClass = 'bg-amber-50 text-amber-600 border border-amber-300 hover:bg-amber-100';
                                else if (isAnswered) btnClass = 'bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-emerald-100';

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQ(i)}
                                        className={`w-full aspect-square rounded-lg text-xs font-black transition-all flex items-center justify-center relative ${btnClass}`}
                                    >
                                        {i + 1}
                                        {isFlagged && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="pt-4 border-t border-border space-y-2 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-300" /> Répondu</div>
                            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-300" /> Signalé à revoir</div>
                            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded bg-slate-50 border border-slate-200" /> Non répondu</div>
                            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded bg-primary" /> Actif</div>
                        </div>
                    </div>
                </div>

                {/* CENTER: Question Content & Resources */}
                <div className="flex-1 w-full max-w-4xl flex flex-col min-h-[calc(100vh-140px)] gap-6">

                    {/* Top Resources (Test Level) */}
                    {testLevelResources.length > 0 && (
                        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all">
                            <button
                                onClick={() => setShowResources(!showResources)}
                                className="w-full flex items-center justify-between p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Icon name="FolderOpenIcon" size={18} className="text-primary" />
                                    Ressources générales du test <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{testLevelResources.length}</span>
                                </span>
                                <Icon name={showResources ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={18} className="text-slate-400" />
                            </button>
                            {showResources && (
                                <div className="p-4 pt-0 space-y-3 bg-slate-50/50">
                                    {testLevelResources.map(r => <ResourcePanel key={r.id} resource={r} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Question Card */}
                    {question && (
                        <div key={question.id} className="bg-white rounded-3xl border border-border shadow-sm p-6 md:p-8 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Question Header */}
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest border border-slate-200">
                                    Valeur: {question.points} point{question.points !== 1 ? 's' : ''}
                                </span>
                                {question.is_required && (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">* Obligatoire</span>
                                )}
                            </div>

                            {/* Specific Resources for this question */}
                            {questionResources.length > 0 && (
                                <div className="mb-6 space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                                        <Icon name="PaperClipIcon" size={12} />
                                        Documents liés à cette question
                                    </p>
                                    {questionResources.map(r => <ResourcePanel key={r.id} resource={r} />)}
                                </div>
                            )}

                            {/* Question Prompt */}
                            <div className="mb-8 pl-4 border-l-4 border-primary/20">
                                {question.title && (
                                    <p className="text-xs font-black text-primary/70 mb-2 uppercase tracking-wide">{question.title}</p>
                                )}
                                <h3 className="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed">
                                    {question.prompt}
                                </h3>
                            </div>

                            {/* Answer Widget */}
                            <div className="flex-1">
                                {renderQuestionInput()}
                            </div>
                        </div>
                    )}

                    {/* BOTTOM: Action Bar */}
                    <div className="sticky bottom-4 z-40 bg-white/80 backdrop-blur-md rounded-2xl border border-border shadow-lg p-4 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                                disabled={currentQ === 0}
                                className="px-5 py-3 border border-slate-200 bg-white rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 flex items-center gap-1 shadow-sm"
                            >
                                <Icon name="ArrowLeftIcon" size={16} />
                                <span className="hidden sm:inline">Précédent</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (!question) return;
                                    setFlagged(prev => ({ ...prev, [question.id]: !prev[question.id] }));
                                }}
                                className={`px-4 py-3 border rounded-xl font-bold text-sm transition-all flex items-center gap-1 shadow-sm ${flagged[question?.id] ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-amber-500 hover:bg-amber-50 hover:border-amber-200'}`}
                                title="Signaler pour revoir plus tard"
                            >
                                <Icon name="FlagIcon" size={16} className={flagged[question?.id] ? 'fill-amber-500' : ''} />
                                <span className="hidden sm:inline">{flagged[question?.id] ? 'Signalé' : 'Signaler'}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {lastSaved && (
                                <span className="text-[10px] font-bold text-slate-400 mr-2 hidden sm:block animate-in fade-in">
                                    💾 Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                            <span className="text-xs font-semibold text-slate-400 hidden md:block">
                                {answeredCount} sur {questions.length} répondus
                            </span>

                            {currentQ < questions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentQ(currentQ + 1)}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    Suivant
                                    <Icon name="ArrowRightIcon" size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        const unanasweredCount = questions.length - answeredCount;
                                        let msg = "Êtes-vous sûr de vouloir terminer le test ?";
                                        if (unanasweredCount > 0) {
                                            msg = `Attention, il vous reste ${unanasweredCount} question(s) non répondue(s).\n\nVoulez-vous quand même terminer et envoyer vos réponses ?`;
                                        }
                                        setConfirmMessage(msg);
                                        setShowConfirmModal(true);
                                    }}
                                    disabled={submitting}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                >
                                    {submitting ? 'Envoi...' : 'Terminer le test'}
                                    {!submitting && <Icon name="PaperAirplaneIcon" size={16} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                title="Terminer le test"
                message={confirmMessage}
                confirmLabel="Oui, terminer"
                cancelLabel="Annuler"
                onConfirm={() => {
                    setShowConfirmModal(false);
                    handleSubmit();
                }}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
}

export default function PracticeTestPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        }>
            <ExamEngine />
        </Suspense>
    );
}
