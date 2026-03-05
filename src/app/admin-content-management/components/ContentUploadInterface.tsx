'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface UploadFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  path?: string;
}

interface ContentUploadInterfaceProps {
  onUpload: (files: File[], uploadedUrls?: string[]) => void;
  acceptedFormats: string[];
  maxSize: string;
}

const ContentUploadInterface = ({
  onUpload,
  acceptedFormats,
  maxSize,
}: ContentUploadInterfaceProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const newFiles: UploadFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    const uploadedUrls: string[] = [];

    // Upload each file to Supabase storage
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = newFiles[i].id;
      
      try {
        // Step 1: Get signed upload URL from our API
        const signedUrlResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
            bucket: 'tcf_storage',
          }),
        });

        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse.json();
          throw new Error(errorData.error || 'Failed to get upload URL');
        }

        const { uploadUrl, path, token } = await signedUrlResponse.json();
        
        // Update progress to 30%
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 30 } : f
          )
        );

        // Step 2: Upload file directly to Supabase using signed URL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to storage');
        }

        // Update progress to 80%
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 80 } : f
          )
        );

        // Step 3: Get public URL
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tcf_storage/${path}`;
        uploadedUrls.push(publicUrl);

        // Update to completed
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: 'completed', url: publicUrl, path } : f
          )
        );

        toast.success(`${file.name} téléchargé avec succès`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        console.error('Upload error:', errorMessage);
        
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'error' } : f
          )
        );
        
        toast.error(`Erreur: ${errorMessage}`);
      }
    }

    onUpload(files, uploadedUrls);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'CheckCircleIcon';
      case 'error':
        return 'XCircleIcon';
      default:
        return 'ArrowPathIcon';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'error':
        return 'text-error';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-academic ${
          isDragging
            ? 'border-primary bg-primary/5' :'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon name="CloudArrowUpIcon" size={32} className="text-primary" />
          </div>
          <div>
            <p className="font-caption text-base font-medium text-foreground">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="mt-1 font-caption text-sm text-muted-foreground">
              ou cliquez pour parcourir
            </p>
          </div>
          <input
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex cursor-pointer items-center space-x-2 rounded-md bg-primary px-6 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md"
          >
            <Icon name="FolderOpenIcon" size={18} />
            <span>Parcourir les fichiers</span>
          </label>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Formats acceptés : {acceptedFormats.join(', ')}</p>
            <p>Taille maximale : {maxSize}</p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-caption text-sm font-medium text-foreground">
            Fichiers téléchargés ({uploadedFiles.length})
          </h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center space-x-3 rounded-lg border border-border bg-card p-4 shadow-academic-sm"
            >
              <div className={`${getStatusColor(file.status)}`}>
                <Icon
                  name={getStatusIcon(file.status) as any}
                  size={24}
                  className={file.status === 'uploading' ? 'animate-spin' : ''}
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-caption text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <span className="font-data text-xs text-muted-foreground">
                    {file.size}
                  </span>
                </div>
                {file.status === 'uploading' && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-academic"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                {file.status === 'completed' && (
                  <p className="font-caption text-xs text-success">
                    Téléchargement terminé
                  </p>
                )}
                {file.status === 'error' && (
                  <p className="font-caption text-xs text-error">
                    Erreur lors du téléchargement
                  </p>
                )}
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="rounded-md p-2 text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
                aria-label="Supprimer le fichier"
              >
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentUploadInterface;
