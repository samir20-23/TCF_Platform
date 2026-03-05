'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';
import QuestionManager from './QuestionManager';
import ReviewCorrectionModal from './ReviewCorrectionModal';

type TestType = 'reading' | 'listening' | 'writing' | 'speaking';

interface Resource {
  id: string;
  title: string | null;
  resource_type: 'audio' | 'video' | 'document' | 'article' | null;
  url: string | null;
  description: string | null;
  published: boolean;
  created_at: string;
  is_required?: boolean;
  replay_limit?: number;
  transcript?: string;
  question_id?: string;
}

interface Test {
  id: string;
  name: string;
  test_type: TestType;
  duration_minutes: number | null;
  level: string | null;
  description: string | null;
  published: boolean;
  created_at: string;
  question_count?: number;
  resources?: Resource[];
}

interface ReviewPending {
  id: string;
  status: string;
  finished_at: string;
  score_total: number;
  users?: { name: string; email: string };
  tests?: { name: string; section_type: string };
  pending_responses_count: number;
}

const AdminTestsManagementInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isManageQuestionsOpen, setIsManageQuestionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'reviews'>('tests');
  const [pendingReviews, setPendingReviews] = useState<ReviewPending[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const [newTest, setNewTest] = useState<{
    name: string;
    test_type: TestType;
    duration_minutes: number | '';
    level: string;
    description: string;
    published: boolean;
  }>({
    name: '',
    test_type: 'listening',
    duration_minutes: '',
    level: 'B2',
    description: '',
    published: false,
  });

  const [newResource, setNewResource] = useState<{
    title: string;
    resource_type: 'audio' | 'video' | 'document' | 'article';
    description: string;
    file: File | null;
    transcript: string;
    replayLimit: number;
    questionId: string;
    isRequired: boolean;
  }>({
    title: '',
    resource_type: 'audio',
    description: '',
    file: null,
    transcript: '',
    replayLimit: 3,
    questionId: '',
    isRequired: false,
  });

  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    setIsHydrated(true);
    const tab = searchParams.get('tab');
    if (tab === 'reviews') {
      setActiveTab('reviews');
      void loadPendingReviews();
    } else {
      setActiveTab('tests');
      void loadTests();
    }

    const reviewId = searchParams.get('attemptId');
    if (reviewId) setSelectedReviewId(reviewId);

  }, [searchParams]);

  useEffect(() => {
    if (isAddResourceOpen && selectedTestId) {
      loadQuestions(selectedTestId);
    }
  }, [isAddResourceOpen, selectedTestId]);

  const loadQuestions = async (testId: string) => {
    try {
      const res = await fetch(`/api/admin/tests/${testId}/questions`);
      const data = await res.json();
      if (data.questions) setCurrentQuestions(data.questions);
    } catch (e) {
      console.error('Error fetching questions:', e);
    }
  };

  const loadPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();
      if (response.ok) {
        setPendingReviews(data.reviews || []);
      }
    } catch (e) {
      toast.error('Erreur lors du chargement des corrections');
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tests');

      if (!response.ok) {
        let message = 'Impossible de charger les tests';
        try {
          const errorData = await response.json();
          if (errorData?.error) message = errorData.error;
        } catch {
          // non‑JSON, keep default
        }
        throw new Error(message);
      }

      const data = await response.json();
      setTests(data.tests || []);

      if (!selectedTestId && data.tests && data.tests.length > 0) {
        setSelectedTestId(data.tests[0].id);
      }
    } catch (e: any) {
      if (e?.name === 'AbortError' || e?.message?.includes('aborted')) return;
      console.error('Error loading tests:', e);
      toast.error('Erreur lors du chargement des tests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest || !editingTest.name.trim()) {
      toast.error('Le nom du test est requis');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tests/${editingTest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTest.name.trim(),
          test_type: editingTest.test_type,
          duration_minutes:
            !editingTest.duration_minutes ? null : Number(editingTest.duration_minutes),
          level: editingTest.level || 'B2',
          description: editingTest.description || null,
          published: editingTest.published,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Échec de la mise à jour du test');
      }

      toast.success('Test mis à jour avec succès');
      setEditingTest(null);
      await loadTests();
    } catch (e: any) {
      console.error('Update test error:', e);
      toast.error(e?.message || 'Erreur lors de la mise à jour du test');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTest = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tests/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        toast.success('Test dupliqué');
        void loadTests();
      } else {
        throw new Error('Échec duplication');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce test ? Cela supprimera également toutes les ressources et questions associées.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tests/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Échec de la suppression du test');
      }

      toast.success('Test supprimé avec succès');
      if (selectedTestId === id) setSelectedTestId(null);
      await loadTests();
    } catch (e: any) {
      console.error('Delete test error:', e);
      toast.error(e?.message || 'Erreur lors de la suppression du test');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string, testId: string) => {
    if (!confirm('Supprimer cette ressource ?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/resources/${resourceId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur suppression ressource');
      toast.success('Ressource supprimée');
      await loadTests();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTest.name.trim()) {
      toast.error('Le nom du test est requis');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTest.name.trim(),
          test_type: newTest.test_type,
          duration_minutes: newTest.duration_minutes === '' ? null : Number(newTest.duration_minutes),
          level: newTest.level || 'B2',
          description: newTest.description || null,
          published: newTest.published,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Échec de la création du test');
      }

      toast.success('Test créé avec succès');
      setIsCreateTestOpen(false);
      setNewTest({
        name: '',
        test_type: 'listening',
        duration_minutes: '',
        level: 'B2',
        description: '',
        published: false,
      });
      await loadTests();
    } catch (e: any) {
      console.error('Create test error:', e);
      toast.error(e?.message || 'Erreur lors de la création du test');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    setNewResource(prev => ({ ...prev, file }));
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId) {
      toast.error('Sélectionnez un test');
      return;
    }
    if (!newResource.file) {
      toast.error('Choisissez un fichier à téléverser');
      return;
    }

    try {
      setLoading(true);
      const file = newResource.file;
      const fileName = `${Date.now()}-${file.name}`;

      // 1) Get signed upload URL
      const uploadMetaRes = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          contentType: file.type,
          fileSize: file.size,
          bucket: 'tcf_storage',
          context: 'tests',
          entityId: selectedTestId,
        }),
      });

      if (!uploadMetaRes.ok) {
        const err = await uploadMetaRes.json().catch(() => ({}));
        throw new Error(err.error || "Échec de l'initialisation de l'upload");
      }

      const { uploadUrl, path, publicUrl: metaPublicUrl } = await uploadMetaRes.json();
      const finalPublicUrl = metaPublicUrl || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tcf_storage/${path}`;

      // 2) Upload file to Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Échec de l'upload du fichier");
      }

      // 3) Create resources row
      const resourceRes = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: selectedTestId,
          title: newResource.title || file.name,
          resourceType: newResource.resource_type,
          url: finalPublicUrl,
          description: newResource.description || null,
          transcript: newResource.transcript || null,
          replayLimit: newResource.replayLimit,
          questionId: newResource.questionId || null,
          isRequired: newResource.isRequired,
          published: true,
        }),
      });

      const resourceData = await resourceRes.json();

      if (!resourceRes.ok) {
        throw new Error(resourceData.details || resourceData.error || 'Échec de la création de la ressource');
      }

      toast.success('Ressource ajoutée avec succès');
      setIsAddResourceOpen(false);
      setNewResource({
        title: '',
        resource_type: 'audio',
        description: '',
        file: null,
        transcript: '',
        replayLimit: 3,
        questionId: '',
        isRequired: false,
      });
      await loadTests();
    } catch (e: any) {
      console.error('Add resource error:', e);
      toast.error(e?.message || 'Erreur lors de la création de la ressource');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icon
            name="ArrowPathIcon"
            size={48}
            className="mx-auto mb-4 animate-spin text-primary"
          />
          <p className="font-caption text-sm text-muted-foreground">Chargement…</p>
        </div>
      </div>
    );
  }

  const selectedTest = tests.find(t => t.id === selectedTestId) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Gestion des tests
          </h1>
          <p className="mt-1 text-muted-foreground">
            Créez, publiez et reliez des ressources aux tests TCF Canada.
          </p>

          <div className="flex items-center space-x-2">
            <div className="flex bg-muted p-1 rounded-lg mr-4">
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'tests' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Tests
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'reviews' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Files d'attente Correction
              </button>
            </div>
            <button
              onClick={() => setIsCreateTestOpen(true)}
              className="flex items-center space-x-2 rounded-md bg-primary px-4 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md"
            >
              <Icon name="PlusIcon" size={18} />
              <span>Nouveau test</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'tests' ? (

        <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
          <div className="rounded-lg border border-border bg-card shadow-academic">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-caption text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tests disponibles
              </h2>
            </div>
            <div className="max-h-[480px] space-y-2 overflow-y-auto p-3">
              {tests.length === 0 && !loading && (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                  <Icon
                    name="QueueListIcon"
                    size={32}
                    className="mx-auto mb-3 text-muted-foreground"
                  />
                  <p className="font-caption text-sm text-muted-foreground">
                    Aucun test pour le moment. Créez votre premier test.
                  </p>
                </div>
              )}
              {tests.map(test => (
                <div
                  key={test.id}
                  className={`group relative flex w-full items-start justify-between rounded-md px-3 py-3 transition-academic ${selectedTestId === test.id
                    ? 'bg-primary/10 ring-1 ring-primary/40'
                    : 'hover:bg-muted'
                    }`}
                >
                  <button
                    onClick={() => setSelectedTestId(test.id)}
                    className="flex-1 text-left"
                  >
                    <div>
                      <p className="font-caption text-sm font-semibold text-foreground">
                        {test.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {test.description || 'Aucune description'}
                      </p>
                    </div>
                  </button>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTest(test.id);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-indigo-200 hover:text-indigo-600 transition-all"
                        title="Dupliquer"
                      >
                        <Icon name="DocumentDuplicateIcon" size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTest(test);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all"
                        title="Modifier"
                      >
                        <Icon name="PencilSquareIcon" size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTestId(test.id);
                          setIsManageQuestionsOpen(true);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-success/20 hover:text-success transition-all"
                        title="Gérer les questions"
                      >
                        <Icon name="ListBulletIcon" size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTest(test.id);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-error/20 hover:text-error transition-all"
                        title="Supprimer"
                      >
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 font-caption text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {test.test_type}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mt-2 space-y-2">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-academic">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-caption text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Détails du test & ressources
              </h2>
            </div>
            <div className="space-y-4 p-4">
              {!selectedTest && (
                <p className="font-caption text-sm text-muted-foreground">
                  Sélectionnez un test dans la liste pour voir ses détails et ses ressources.
                </p>
              )}
              {selectedTest && (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {selectedTest.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedTest.description || 'Aucune description fournie.'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center space-x-1">
                          <Icon name="ClockIcon" size={14} />
                          <span>
                            {selectedTest.duration_minutes
                              ? `${selectedTest.duration_minutes} min`
                              : 'Durée non spécifiée'}
                          </span>
                        </span>
                        <span className="inline-flex items-center space-x-1">
                          <Icon name="CalendarIcon" size={14} />
                          <span>
                            Créé le{' '}
                            {new Date(
                              selectedTest.created_at,
                            ).toLocaleDateString('fr-CA')}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="rounded-full bg-muted px-3 py-1 font-caption text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {selectedTest.test_type}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-caption text-xs font-semibold ${selectedTest.published
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                          }`}
                      >
                        {selectedTest.published ? 'Test publié' : 'Brouillon'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-caption text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Ressources liées
                      </h4>
                      <button
                        onClick={() => setIsAddResourceOpen(true)}
                        className="inline-flex items-center space-x-1 rounded-md bg-primary/10 px-3 py-1 font-caption text-xs font-medium text-primary hover:bg-primary/15"
                      >
                        <Icon name="PlusIcon" size={14} />
                        <span>Ajouter</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {!selectedTest.resources || selectedTest.resources.length === 0 ? (
                        <p className="font-caption text-sm text-muted-foreground">
                          Aucune ressource pour ce test pour le moment.
                        </p>
                      ) : (
                        selectedTest.resources.map(res => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                name={
                                  res.resource_type === 'audio'
                                    ? 'SpeakerWaveIcon'
                                    : res.resource_type === 'video'
                                      ? 'PlayCircleIcon'
                                      : 'DocumentTextIcon'
                                }
                                size={16}
                                className="text-primary"
                              />
                              <div>
                                <p className="font-caption text-sm font-medium text-foreground">
                                  {res.title || res.resource_type || 'Ressource'}
                                </p>
                                {res.url && (
                                  <div className="flex items-center space-x-2">
                                    <a
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-caption text-xs text-primary underline underline-offset-2"
                                    >
                                      Ouvrir
                                    </a>
                                    <span className="text-muted-foreground">•</span>
                                    <button
                                      onClick={() => handleDeleteResource(res.id, selectedTest.id)}
                                      className="text-xs text-error hover:underline"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {res.is_required && (
                                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  Obligatoire
                                </span>
                              )}
                              {(res.resource_type === 'audio' || res.resource_type === 'video') && res.replay_limit && (
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  Limite: {res.replay_limit}x
                                </span>
                              )}
                              <span
                                className={`rounded-full px-2 py-0.5 font-caption text-[10px] font-semibold ${res.published !== false
                                  ? 'bg-success/10 text-success'
                                  : 'bg-muted text-muted-foreground'
                                  }`}
                              >
                                {res.published !== false ? 'Publié' : 'Masqué'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="rounded-lg border border-border bg-card shadow-academic">
            <div className="border-b border-border px-4 py-3 bg-muted/20 flex items-center justify-between">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
                <Icon name="CheckBadgeIcon" size={16} className="mr-2" />
                Files d&apos;attente Correction
              </h2>
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingReviews.length}
              </span>
            </div >

            <div className="divide-y divide-border">
              {pendingReviews.length === 0 && !loading && (
                <div className="p-12 text-center text-muted-foreground">
                  <Icon name="CheckCircleIcon" size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Toutes les soumissions ont été traitées !</p>
                </div>
              )}

              {pendingReviews.map((rev) => (
                <div key={rev.id} className="p-4 hover:bg-muted/30 transition-all group flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold">
                      {rev.users?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{rev.users?.name || 'Étudiant'}</h3>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-0.5">
                        <span className="bg-muted px-2 py-0.5 rounded font-medium">{rev.tests?.name}</span>
                        <span>•</span>
                        <span>Soumis le {new Date(rev.finished_at).toLocaleDateString('fr-CA')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</span>
                      <span className="text-xs font-bold">{rev.tests?.section_type === 'writing' ? 'Expression Écrite' : 'Expression Orale'}</span>
                    </div>

                    <button
                      onClick={() => setSelectedReviewId(rev.id)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 shadow-sm transition-all hover:scale-105"
                    >
                      Démarrer la correction
                    </button>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
                </div>
              )}
            </div>
          </div >
        </div >
      )}

      {/* Create / Edit Test Modal */}
      {
        (isCreateTestOpen || editingTest) && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-academic-xl">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {editingTest ? 'Modifier le test' : 'Créer un nouveau test'}
                </h2>
                <button
                  onClick={() => {
                    setIsCreateTestOpen(false);
                    setEditingTest(null);
                  }}
                  className="rounded-md p-2 text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
                >
                  <Icon name="XMarkIcon" size={18} />
                </button>
              </div>
              <form onSubmit={editingTest ? handleUpdateTest : handleCreateTest} className="space-y-4 p-4">
                <div>
                  <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                    Nom du test *
                  </label>
                  <input
                    type="text"
                    value={editingTest ? editingTest.name : newTest.name}
                    onChange={e => editingTest
                      ? setEditingTest({ ...editingTest, name: e.target.value })
                      : setNewTest(prev => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Ex: Compréhension orale — Série 1"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                      Type de test
                    </label>
                    <select
                      value={editingTest ? editingTest.test_type : newTest.test_type}
                      onChange={e => editingTest
                        ? setEditingTest({ ...editingTest, test_type: e.target.value as TestType })
                        : setNewTest(prev => ({
                          ...prev,
                          test_type: e.target.value as TestType,
                        }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="listening">Compréhension orale</option>
                      <option value="reading">Compréhension écrite</option>
                      <option value="writing">Expression écrite</option>
                      <option value="speaking">Expression orale</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                      Durée (minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      value={editingTest ? (editingTest.duration_minutes ?? '') : newTest.duration_minutes}
                      onChange={e => editingTest
                        ? setEditingTest({ ...editingTest, duration_minutes: e.target.value === '' ? null : Number(e.target.value) })
                        : setNewTest(prev => ({
                          ...prev,
                          duration_minutes: e.target.value === '' ? '' : Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground">
                      Niveau (CEFR)
                    </label>
                    <select
                      value={editingTest ? editingTest.level || 'B2' : newTest.level}
                      onChange={(e) =>
                        editingTest
                          ? setEditingTest({ ...editingTest, level: e.target.value })
                          : setNewTest({ ...newTest, level: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="A1">A1 - Débutant</option>
                      <option value="A2">A2 - Élémentaire</option>
                      <option value="B1">B1 - Intermédiaire</option>
                      <option value="B2">B2 - Intermédiaire Avancé</option>
                      <option value="C1">C1 - Autonome</option>
                      <option value="C2">C2 - Maîtrise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    value={editingTest ? (editingTest.description ?? '') : newTest.description}
                    onChange={e => editingTest
                      ? setEditingTest({ ...editingTest, description: e.target.value })
                      : setNewTest(prev => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Décrivez brièvement le contenu et les objectifs du test."
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <label className="inline-flex items-center space-x-2 font-caption text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={editingTest ? editingTest.published : newTest.published}
                      onChange={e => editingTest
                        ? setEditingTest({ ...editingTest, published: e.target.checked })
                        : setNewTest(prev => ({ ...prev, published: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/40"
                    />
                    <span>{editingTest ? 'Statut : Publié' : 'Publier immédiatement'}</span>
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateTestOpen(false);
                        setEditingTest(null);
                      }}
                      className="rounded-md border border-border bg-background px-4 py-2 font-caption text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-md bg-primary px-4 py-2 font-caption text-sm font-medium text-primary-foreground shadow-academic hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading ? 'Traitement…' : editingTest ? 'Sauvegarder' : 'Créer le test'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Add Resource Modal */}
      {
        isAddResourceOpen && selectedTest && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-academic-xl">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Ajouter une ressource au test
                </h2>
                <button
                  onClick={() => setIsAddResourceOpen(false)}
                  className="rounded-md p-2 text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
                >
                  <Icon name="XMarkIcon" size={18} />
                </button>
              </div>
              <form onSubmit={handleAddResource} className="space-y-4 p-4">
                <div>
                  <p className="font-caption text-xs text-muted-foreground">
                    Test cible :{' '}
                    <span className="font-medium text-foreground">{selectedTest.name}</span>
                  </p>
                </div>
                <div>
                  <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                    Titre de la ressource
                  </label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={e =>
                      setNewResource(prev => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Ex: Audio – Partie 1"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                      Type de ressource
                    </label>
                    <select
                      value={newResource.resource_type}
                      onChange={e =>
                        setNewResource(prev => ({
                          ...prev,
                          resource_type: e.target.value as any,
                        }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="audio">Audio (écoute / oral)</option>
                      <option value="video">Vidéo</option>
                      <option value="document">Document (PDF)</option>
                      <option value="article">Article / lien</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                      Fichier
                    </label>
                    <input
                      type="file"
                      onChange={e => handleFileChange(e.target.files?.[0] || null)}
                      className="w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                    Description (optionnelle)
                  </label>
                  <textarea
                    value={newResource.description}
                    onChange={e =>
                      setNewResource(prev => ({ ...prev, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Conditional Fields: Audio/Video */}
                {(newResource.resource_type === 'audio' || newResource.resource_type === 'video') && (
                  <>
                    <div>
                      <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                        Transcription (ou contenu)
                      </label>
                      <textarea
                        value={newResource.transcript}
                        onChange={e =>
                          setNewResource(prev => ({ ...prev, transcript: e.target.value }))
                        }
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Texte de l'audio ou de la vidéo..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                        Limite de lecture (nombre de fois)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newResource.replayLimit}
                        onChange={e =>
                          setNewResource(prev => ({ ...prev, replayLimit: parseInt(e.target.value) || 3 }))
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-caption text-sm font-medium text-foreground">
                      Attacher à une question spécifique
                    </label>
                    <select
                      value={newResource.questionId}
                      onChange={e =>
                        setNewResource(prev => ({ ...prev, questionId: e.target.value }))
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 font-caption text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Ressource globale (pour le test entier)</option>
                      {currentQuestions.map((q: any) => (
                        <option key={q.id} value={q.id}>
                          Q{q.order_index + 1}: {q.title || (q.prompt ? q.prompt.substring(0, 30) : 'Sans description')}...
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="isRequired"
                      checked={newResource.isRequired}
                      onChange={e =>
                        setNewResource(prev => ({ ...prev, isRequired: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isRequired" className="font-caption text-sm font-medium text-foreground">
                      Ressource obligatoire
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddResourceOpen(false)}
                    className="rounded-md border border-border bg-background px-4 py-2 font-caption text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-primary px-4 py-2 font-caption text-sm font-medium text-primary-foreground shadow-academic hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Ajout…' : 'Ajouter la ressource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {
        isManageQuestionsOpen && selectedTestId && (
          <div className="fixed inset-0 z-[2200] overflow-y-auto" style={{ margin: '0' }}>
            <QuestionManager
              testId={selectedTestId}
              onClose={() => setIsManageQuestionsOpen(false)}
            />
          </div>
        )
      }

      {
        selectedReviewId && (
          <ReviewCorrectionModal
            attemptId={selectedReviewId}
            onClose={() => setSelectedReviewId(null)}
            onComplete={() => {
              setSelectedReviewId(null);
              void loadPendingReviews();
            }}
          />
        )
      }
    </div>
  );
};

export default AdminTestsManagementInteractive;
