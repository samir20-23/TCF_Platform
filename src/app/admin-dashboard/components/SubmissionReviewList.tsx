'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';

const SubmissionReviewList = () => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/reviews');
            const data = await response.json();
            if (response.ok) {
                setSubmissions(data.reviews || []);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse space-y-4 pt-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg w-full"></div>)}
        </div>;
    }

    return (
        <div className="bg-card border border-border rounded-xl shadow-academic overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                <h2 className="font-heading font-bold text-lg">Files d'attente Correction</h2>
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {submissions.length}
                </span>
            </div>

            {submissions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    <Icon name="CheckCircleIcon" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Toutes les corrections ont été traitées !</p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {submissions.map((sub) => (
                        <div key={sub.id} className="p-4 hover:bg-muted/30 transition-academic group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {sub.users?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{sub.users?.name || 'Étudiant'}</p>
                                        <p className="text-xs text-muted-foreground">{sub.tests?.name} • {new Date(sub.end_time || sub.start_time).toLocaleDateString('fr-CA')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{sub.pending_responses_count} répliques</p>
                                    </div>
                                    <Link
                                        href={`/admin-content-management?tab=reviews&attemptId=${sub.id}`}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/90 shadow-sm"
                                    >
                                        Correction
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubmissionReviewList;
