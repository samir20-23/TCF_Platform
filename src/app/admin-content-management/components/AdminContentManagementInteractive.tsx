'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import ContentPerformancePanel from './ContentPerformancePanel';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface Section {
  id: string;
  title: string;
  description: string;
  lessons: Array<{
    id: string;
    title: string;
    type: 'video' | 'pdf' | 'exercise';
    status: 'published' | 'draft' | 'archived';
    views: number;
    completionRate: number;
    publishedDate: string;
    duration?: string;
    video_url?: string;
    pdf_url?: string;
    media_url?: string;
    is_preview?: boolean;
    description?: string;
  }>;
  isExpanded: boolean;
  thumbnail_url?: string;
}

const AdminContentManagementInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'structure' | 'performance'>('structure');
  const [sections, setSections] = useState<Section[]>([]);
  const supabase = createClient();

  // Delete confirmation modal for courses
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseTitle: string;
  }>({ isOpen: false, courseId: '', courseTitle: '' });

  // Delete confirmation modal for lessons (F1)
  const [deleteLessonModal, setDeleteLessonModal] = useState<{
    isOpen: boolean;
    sectionId: string;
    lessonId: string;
    lessonTitle: string;
  }>({ isOpen: false, sectionId: '', lessonId: '', lessonTitle: '' });

  // Edit course modal
  const [editCourseModal, setEditCourseModal] = useState<{
    isOpen: boolean;
    courseId: string;
    title: string;
    description: string;
    section: string;
    thumbnail_url: string;
    required_subscription: string;
  }>({ isOpen: false, courseId: '', title: '', description: '', section: '', thumbnail_url: '', required_subscription: 'Gratuit' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('display_order', { ascending: true });

      if (coursesError) throw coursesError;

      // Fetch all lesson progress stats in one go to be efficient
      const { data: progressStats } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, is_completed');

      const statsMap: Record<string, { views: number; completions: number }> = {};
      progressStats?.forEach(stat => {
        if (!statsMap[stat.lesson_id]) {
          statsMap[stat.lesson_id] = { views: 0, completions: 0 };
        }
        statsMap[stat.lesson_id].views++;
        if (stat.is_completed) {
          statsMap[stat.lesson_id].completions++;
        }
      });

      // Fetch lessons for each course
      const sectionsWithLessons = await Promise.all((coursesData || []).map(async (course) => {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
          .order('display_order', { ascending: true });

        if (lessonsError) throw lessonsError;

        return {
          id: course.id,
          title: course.title,
          description: course.description || course.short_description || '',
          thumbnail_url: course.thumbnail_url || course.image_url || '', // Add this
          isExpanded: false,
          lessons: (lessonsData || []).map(lesson => {
            const stats = statsMap[lesson.id] || { views: 0, completions: 0 };
            // Handle both old (published) and new (is_published) column names
            const isPublished = lesson.is_published ?? lesson.published ?? false;
            return {
              id: lesson.id,
              title: lesson.title,
              type: (lesson.type?.toLowerCase() || 'exercise') as any,
              status: (isPublished ? 'published' : 'draft') as any,
              views: stats.views,
              completionRate: stats.views > 0 ? Math.round((stats.completions / stats.views) * 100) : 0,
              publishedDate: new Date(lesson.created_at).toLocaleDateString('fr-FR'),
              duration: lesson.duration_minutes ? `${lesson.duration_minutes} min` : undefined,
              // Include additional fields for edit modal
              video_url: lesson.video_url || lesson.content_url,
              pdf_url: lesson.pdf_url,
              media_url: lesson.media_url,
              description: lesson.description,
              is_preview: lesson.is_preview,
              duration_minutes: lesson.duration_minutes,
              difficulty: lesson.difficulty,
              required_subscription: lesson.required_subscription || 'Gratuit',
            };
          })
        };
      }));

      setSections(sectionsWithLessons);
    } catch (err: any) {
      // Ignore AbortError noise
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return;
      console.error('Error loading content:', err);
      toast.error('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [newCourseData, setNewCourseData] = useState({ title: '', section: 'Compréhension orale', description: '', thumbnail_url: '' });

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalViews = sections.reduce((acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + l.views, 0), 0);

  // Derived metrics for the performance tab
  const performanceMetrics = [
    {
      label: 'Total de vues',
      value: totalViews.toLocaleString(),
      change: 0,
      icon: 'EyeIcon',
      trend: 'neutral' as const,
    },
    {
      label: 'Taux de complétion moyen',
      value: `${totalLessons > 0 ? Math.round(sections.reduce((acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + l.completionRate, 0), 0) / totalLessons) : 0}%`,
      change: 0,
      icon: 'ChartBarIcon',
      trend: 'neutral' as const,
    },
    {
      label: 'Cours créés',
      value: sections.length.toString(),
      change: 0,
      icon: 'Square3Stack3DIcon',
      trend: 'neutral' as const,
    },
    {
      label: 'Leçons publiées',
      value: totalLessons.toString(),
      change: 0,
      icon: 'DocumentCheckIcon',
      trend: 'neutral' as const,
    },
  ];

  // Group views by section (mapped to labels)
  const viewsData = sections.map(s => ({
    name: s.title.split(' ')[0], // Short name
    views: s.lessons.reduce((acc, l) => acc + l.views, 0)
  })).slice(0, 4);

  // Default mock data for completion if no real history yet
  const completionData = [
    { name: 'Sem 1', rate: 65 },
    { name: 'Sem 2', rate: 68 },
    { name: 'Sem 3', rate: 71 },
    { name: 'Sem 4', rate: 73 },
  ];

  useEffect(() => {
    setIsHydrated(true);
    loadData();
  }, [loadData]);


  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={48} className="mx-auto mb-4 animate-spin text-primary" />
          <p className="font-caption text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleToggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const handleEditLesson = (sectionId: string, lessonId: string) => {
    setCurrentSectionId(sectionId);
    setCurrentLessonId(lessonId);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleAddLesson = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleReorderLesson = (sectionId: string, lessonId: string, direction: 'up' | 'down') => {
    // Find the section and clone it
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newSections = [...sections];
    const section = { ...newSections[sectionIndex] };
    const newLessons = [...section.lessons];

    // Find the lesson index
    const lessonIndex = newLessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return;

    // Calculate target index
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;

    // Boundary checks
    if (targetIndex < 0 || targetIndex >= newLessons.length) return;

    // Swap elements
    [newLessons[lessonIndex], newLessons[targetIndex]] = [
      newLessons[targetIndex],
      newLessons[lessonIndex],
    ];

    // Update section with new lessons
    section.lessons = newLessons;
    newSections[sectionIndex] = section;

    // Update state immediately for UI
    setSections(newSections);

    // Persist changes
    handleReorderPersist(sectionId, newLessons);
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      setLoading(true);

      if (courseData.id) {
        // Update existing course via direct supabase call
        const { error } = await supabase
          .from('courses')
          .update({
            title: courseData.title,
            description: courseData.description || '',
            section: courseData.section || 'Compréhension orale',
            thumbnail_url: courseData.thumbnail_url,
            image_url: courseData.thumbnail_url, // Keep in sync
            required_subscription: courseData.required_subscription || 'Gratuit', // Ensure defaults
            updated_at: new Date().toISOString(),
          })
          .eq('id', courseData.id);
        if (error) throw error;
        toast.success('Cours mis à jour');
      } else {
        // Create new course via API (uses service role key)
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: courseData.title,
            description: courseData.description || '',
            section: courseData.section || 'Compréhension orale',
            thumbnail_url: courseData.thumbnail_url || null,
            published: false,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('API Error:', result);
          throw new Error(result.details || result.error || 'Failed to create course');
        }

        toast.success('Cours créé avec succès');
      }
      loadData();
    } catch (error: any) {
      // Ignore AbortError noise
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving course:', errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteCourseClick = (courseId: string) => {
    const course = sections.find(s => s.id === courseId);
    setDeleteModal({
      isOpen: true,
      courseId,
      courseTitle: course?.title || '',
    });
  };

  // Actually delete the course after confirmation
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${deleteModal.courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete course');
      }

      toast.success('Cours supprimé');
      loadData();
      setDeleteModal({ isOpen: false, courseId: '', courseTitle: '' });
    } catch (error: any) {
      // Ignore AbortError noise
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
      console.error('Error deleting course:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // F1: Open delete lesson confirmation modal
  const handleDeleteLessonClick = (sectionId: string, lessonId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const lesson = section?.lessons.find(l => l.id === lessonId);
    setDeleteLessonModal({
      isOpen: true,
      sectionId,
      lessonId,
      lessonTitle: lesson?.title || '',
    });
  };

  // F1: Actually delete the lesson after confirmation
  const handleConfirmDeleteLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${deleteLessonModal.lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete lesson');
      }

      toast.success('Leçon supprimée');
      loadData();
      setDeleteLessonModal({ isOpen: false, sectionId: '', lessonId: '', lessonTitle: '' });
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Open edit course modal
  const handleEditCourseClick = (courseId: string) => {
    const course = sections.find(s => s.id === courseId);
    if (course) {
      setEditCourseModal({
        isOpen: true,
        courseId,
        title: course.title,
        description: course.description,
        section: course.section || 'Compréhension orale',
        thumbnail_url: course.thumbnail_url || '',
        required_subscription: (course as any).required_subscription || 'Gratuit'
      });
      // Better way to get course thumbnail, looked at loadData
      // The sections array doesn't seem to have thumbnail_url on it?
      // Wait, sections is mapped from coursesData. 
      // I need to check how sections is constructed. 
      // It is constructed in loadData line 90.
      // Let's assume I need to fetch it or finding it from somewhere else.
      // Actually, sections is just a UI Model. I should check if I can pass it.
      // Re-reading loadData: it maps coursesData.
      // I should update sections interface or just fetch the course again?
      // Or I can just update the sections state to include thumbnail_url
      // Let's modify sections Construction in loadData first to include it.

    }
  };

  // Save edited course
  const handleSaveEditedCourse = async () => {
    if (!editCourseModal.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    await handleSaveCourse({
      id: editCourseModal.courseId,
      title: editCourseModal.title,
      description: editCourseModal.description,
      section: editCourseModal.section,
      thumbnail_url: editCourseModal.thumbnail_url,
      required_subscription: editCourseModal.required_subscription
    });
    setEditCourseModal({ isOpen: false, courseId: '', title: '', description: '', section: '', thumbnail_url: '', required_subscription: 'Gratuit' });
  };

  const handleSaveLesson = async (lessonData: any) => {
    try {
      setLoading(true);

      if (editorMode === 'edit') {
        const response = await fetch(`/api/lessons/${currentLessonId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: lessonData.title,
            is_published: lessonData.status === 'published',
            published: lessonData.status === 'published', // Fallback
            video_url: lessonData.videoUrl || null,
            pdf_url: lessonData.pdfUrl || null,
            media_url: lessonData.mediaUrl || null,
            description: lessonData.description || '',
            type: lessonData.type, // F4 Fix: Send as top-level field
            duration_minutes: lessonData.duration_minutes, // F4 Fix: Send as top-level field
            difficulty: lessonData.difficulty,
            subscription_required: lessonData.subscriptionLevel === 'Gratuit' ? false : true, // Boolean compat
            required_subscription: lessonData.subscriptionLevel, // Text enum
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.details || result.error || 'Failed to update lesson');
        }
        toast.success('Leçon mise à jour');
      } else {
        // Calculate next display order
        const currentSection = sections.find(s => s.id === currentSectionId);
        const nextOrder = currentSection ? currentSection.lessons.length + 1 : 1;

        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: currentSectionId,
            title: lessonData.title,
            is_published: lessonData.status === 'published',
            published: lessonData.status === 'published',
            required_subscription: lessonData.subscriptionLevel,
            subscription_required: lessonData.subscriptionLevel === 'Gratuit' ? false : true,
            video_url: lessonData.videoUrl || null,
            pdf_url: lessonData.pdfUrl || null,
            media_url: lessonData.mediaUrl || null,
            description: lessonData.description || '',
            type: lessonData.type,
            duration_minutes: lessonData.duration_minutes,
            difficulty: lessonData.difficulty,
            display_order: nextOrder,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.details || result.error || 'Failed to create lesson');
        }

        toast.success('Leçon créée avec succès');
      }
      setIsEditorOpen(false);
      loadData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error saving lesson:', errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderPersist = async (sectionId: string, lessons: any[]) => {
    try {
      // Optimistic update
      setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
          return { ...s, lessons };
        }
        return s;
      }));

      // In a real app, we would send a batch update to the server
      // For now, we'll just log it.  To implement truly:
      // await supabase.rpc('reorder_lessons', { updates: lessons.map((l, i) => ({ id: l.id, order: i + 1 })) })
      // Or separate API call.

      /* 
        Example API call for reordering (would need a new endpoint or loop)
        const updates = lessons.map((l, i) => ({ id: l.id, display_order: i + 1 }));
        await fetch('/api/lessons/reorder', {
             method: 'POST',
             body: JSON.stringify({ updates })
        });
       */

      // Simple loop for now to prove concept (not efficient for large lists, but functional for MVP)
      // Better to use a single RPC call in Supabase.
      for (let i = 0; i < lessons.length; i++) {
        await supabase.from('lessons').update({ display_order: i + 1 }).eq('id', lessons[i].id);
      }

      toast.success('Ordre mis à jour');

    } catch (error) {
      console.error("Reorder failed", error);
      toast.error("Échec de la réorganisation");
      loadData(); // Revert
    }
  };


  /* FIX: Correct type mapping for getCurrentLessonData */
  const getCurrentLessonData = () => {
    if (editorMode === 'create') return undefined;

    const section = sections.find((s) => s.id === currentSectionId);
    const lesson = section?.lessons.find((l) => l.id === currentLessonId);

    if (!lesson) return undefined;

    return {
      title: lesson.title,
      type: (lesson.type?.toUpperCase() || 'LISTENING') as any, // Cast to any to satisfy the strict LessonType enum if mismatch exists
      status: lesson.status,
      videoUrl: (lesson as any).video_url,
      pdfUrl: (lesson as any).pdf_url,
      mediaUrl: (lesson as any).media_url,
      description: (lesson as any).description,
      subscriptionLevel: (lesson as any).required_subscription || 'Gratuit',
      duration_minutes: (lesson as any).duration_minutes || 15,
      difficulty: (lesson as any).difficulty || 'Débutant',
    };
  };

  /* Helper for file upload in standard components */
  const handleThumbnailUpload = async (file: File) => {
    try {
      setLoading(true);
      const fileName = `${Date.now()}-${file.name}`;

      // 1. Get signed upload URL
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // B1 Fix: Add missing header
        body: JSON.stringify({
          fileName,
          contentType: file.type,
          fileSize: file.size,
          bucket: 'tcf_storage',
          context: 'courses', // F2: Organized path
        })
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, path } = await response.json();

      // 2. Upload file directly to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      // 3. Construct public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tcf_storage/${path}`;

      setNewCourseData(prev => ({ ...prev, thumbnail_url: publicUrl }));
      toast.success("Image uploadée !");

    } catch (error) {
      console.error("Thumbnail upload error:", error);
      toast.error("Erreur d'upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Gestion du contenu
          </h1>
          <p className="mt-1 text-muted-foreground">
            Créez et organisez les cours TCF Canada
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="flex items-center space-x-2 rounded-md border border-primary text-primary px-4 py-3 font-caption text-sm font-medium transition-academic hover:bg-primary/5"
          >
            <Icon name="PlusIcon" size={18} />
            <span>Nouveau cours</span>
          </button>
          <button
            onClick={() => {
              if (sections.length === 0) {
                toast.error('Créez d\'abord un cours avant d\'ajouter une leçon');
                return;
              }
              setCurrentSectionId(sections[0]?.id || '');
              setEditorMode('create');
              setIsEditorOpen(true);
            }}
            className="flex items-center space-x-2 rounded-md bg-primary px-6 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md"
          >
            <Icon name="DocumentPlusIcon" size={18} />
            <span>Nouvelle leçon</span>
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-academic">
        <div className="flex space-x-1 border-b border-border p-2">
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center space-x-2 rounded-md px-4 py-2 font-caption text-sm font-medium transition-academic ${activeTab === 'structure' ? 'bg-primary text-primary-foreground shadow-academic' : 'text-foreground hover:bg-muted'
              }`}
          >
            <Icon name="QueueListIcon" size={18} />
            <span>Structure des cours</span>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center space-x-2 rounded-md px-4 py-2 font-caption text-sm font-medium transition-academic ${activeTab === 'performance'
              ? 'bg-primary text-primary-foreground shadow-academic' : 'text-foreground hover:bg-muted'
              }`}
          >
            <Icon name="ChartBarIcon" size={18} />
            <span>Performance</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'performance' && (
            <ContentPerformancePanel
              metrics={performanceMetrics}
              viewsData={viewsData}
              completionData={completionData}
            />
          )}
        </div>
      </div>

      {/* Course Creation Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-academic-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Créer un nouveau cours
              </h2>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="rounded-md p-2 text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCourseData.title.trim()) {
                  toast.error('Le titre est requis');
                  return;
                }
                await handleSaveCourse(newCourseData);
                setIsCourseModalOpen(false);
                setNewCourseData({ title: '', section: 'Compréhension orale', description: '', thumbnail_url: '' });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Titre du cours *
                </label>
                <input
                  type="text"
                  value={newCourseData.title}
                  onChange={(e) => setNewCourseData({ ...newCourseData, title: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-caption text-sm text-foreground transition-academic focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Ex: Compréhension Orale - Niveau B1"
                  autoFocus
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Image de couverture (Thumbnail)
                </label>
                <div className="flex items-center gap-4">
                  {newCourseData.thumbnail_url && (
                    <img
                      src={newCourseData.thumbnail_url}
                      alt="Preview"
                      className="h-16 w-24 object-cover rounded-md border border-border"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(file);
                    }}
                    disabled={loading}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Section TCF
                </label>
                <select
                  value={newCourseData.section}
                  onChange={(e) => setNewCourseData({ ...newCourseData, section: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-caption text-sm text-foreground transition-academic focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="Compréhension orale">Compréhension orale</option>
                  <option value="Compréhension écrite">Compréhension écrite</option>
                  <option value="Expression écrite">Expression écrite</option>
                  <option value="Expression orale">Expression orale</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={newCourseData.description}
                  onChange={(e) => setNewCourseData({ ...newCourseData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-caption text-sm text-foreground transition-academic focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Description du cours..."
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="rounded-md border border-border bg-background px-6 py-2.5 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 rounded-md bg-primary px-6 py-2.5 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md disabled:opacity-50"
                >
                  <Icon name="CheckIcon" size={18} />
                  <span>{loading ? 'Création...' : 'Créer le cours'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: '', courseTitle: '' })}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce cours ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.courseTitle}" et toutes ses leçons ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={loading}
      />

      {/* F1: Lesson Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteLessonModal.isOpen}
        onClose={() => setDeleteLessonModal({ isOpen: false, sectionId: '', lessonId: '', lessonTitle: '' })}
        onConfirm={handleConfirmDeleteLesson}
        title="Supprimer cette leçon ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteLessonModal.lessonTitle}" ? Les fichiers associés (vidéo, PDF) seront également supprimés. Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={loading}
      />

      {/* Edit Course Modal */}
      {editCourseModal.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-academic-xl">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Modifier le cours
              </h2>
              <button
                onClick={() => setEditCourseModal({ isOpen: false, courseId: '', title: '', description: '', section: '', thumbnail_url: '' })}
                className="rounded-md p-2 text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Titre du cours *
                </label>
                <input
                  type="text"
                  value={editCourseModal.title}
                  onChange={(e) => setEditCourseModal({ ...editCourseModal, title: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-caption text-sm text-foreground transition-academic focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Section TCF
                </label>
                <select
                  value={editCourseModal.section}
                  onChange={(e) => setEditCourseModal({ ...editCourseModal, section: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-caption text-sm text-foreground transition-academic focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="Compréhension orale">Compréhension orale</option>
                  <option value="Compréhension écrite">Compréhension écrite</option>
                  <option value="Expression écrite">Expression écrite</option>
                  <option value="Expression orale">Expression orale</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={editCourseModal.description}
                  onChange={(e) => setEditCourseModal({ ...editCourseModal, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-caption text-sm text-foreground transition-academic focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Description du cours..."
                />
              </div>
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Niveau d'abonnement requis
                </label>
                <select
                  value={editCourseModal.required_subscription}
                  onChange={(e) => setEditCourseModal({ ...editCourseModal, required_subscription: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 font-caption text-sm text-foreground transition-academic focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="Gratuit">Gratuit</option>
                  <option value="Basique">Basique</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              {/* Thumbnail Upload in Edit Mode */}
              <div>
                <label className="mb-2 block font-caption text-sm font-medium text-foreground">
                  Image de couverture (Thumbnail)
                </label>
                <div className="flex items-center gap-4">
                  {editCourseModal.thumbnail_url && (
                    <img
                      src={editCourseModal.thumbnail_url}
                      alt="Preview"
                      className="h-16 w-24 object-cover rounded-md border border-border"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Reuse handleThumbnailUpload but update editCourseModal state
                        // We need a separate handler or we can hack it. 
                        // Let's duplicate the logic to avoid state conflict or make a generic one.
                        // But for now, let's just inline a quick fetch or better:
                        // Create a specific handler for this modal
                        (async () => {
                          try {
                            setLoading(true);
                            const fileName = `${Date.now()}-${file.name}`;
                            const response = await fetch('/api/storage/upload', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }, // B1 Fix: Add missing header
                              body: JSON.stringify({ fileName, contentType: file.type, fileSize: file.size, bucket: 'tcf_storage', context: 'courses' })
                            });
                            if (!response.ok) throw new Error('Failed to get upload URL');
                            const { uploadUrl, path } = await response.json();
                            const uploadResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
                            if (!uploadResponse.ok) throw new Error('Upload failed');
                            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tcf_storage/${path}`;

                            setEditCourseModal(prev => ({ ...prev, thumbnail_url: publicUrl }));
                            toast.success("Image uploadée !");
                          } catch (e) {
                            console.error(e);
                            toast.error("Erreur d'upload");
                          } finally {
                            setLoading(false);
                          }
                        })();
                      }
                    }}
                    disabled={loading}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  // Also fix the Cancel button to reset thumbnail_url
                  onClick={() => setEditCourseModal({ isOpen: false, courseId: '', title: '', description: '', section: '', thumbnail_url: '', required_subscription: 'Gratuit' })}
                  className="rounded-md border border-border bg-background px-6 py-2.5 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEditedCourse}
                  disabled={loading}
                  className="flex items-center space-x-2 rounded-md bg-primary px-6 py-2.5 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md disabled:opacity-50"
                >
                  <Icon name="CheckIcon" size={18} />
                  <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentManagementInteractive;
