'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Credential {
  role: string;
  email: string;
  password: string;
  icon: string;
}

interface DemoCredentialsProps {
  onCopyCredentials: (email: string, password: string) => void;
}

const DemoCredentials = ({ onCopyCredentials }: DemoCredentialsProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const credentials: Credential[] = [
    {
      role: 'Étudiant',
      email: 'etudiant@tcfcanada.com',
      password: 'Etudiant123!',
      icon: 'AcademicCapIcon',
    },
    {
      role: 'Administrateur',
      email: 'admin@tcfcanada.com',
      password: 'Admin123!',
      icon: 'ShieldCheckIcon',
    },
  ];

  const handleCopy = (credential: Credential, index: number) => {
    if (!isHydrated) return;
    
    onCopyCredentials(credential.email, credential.password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isHydrated) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <button
          disabled
          className="flex w-full items-center justify-between font-caption text-sm font-medium text-foreground"
        >
          <span className="flex items-center space-x-2">
            <Icon name="InformationCircleIcon" size={18} />
            <span>Identifiants de démonstration</span>
          </span>
          <Icon name="ChevronDownIcon" size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between font-caption text-sm font-medium text-foreground transition-academic hover:text-primary"
      >
        <span className="flex items-center space-x-2">
          <Icon name="InformationCircleIcon" size={18} />
          <span>Identifiants de démonstration</span>
        </span>
        <Icon
          name="ChevronDownIcon"
          size={18}
          className={`transition-academic ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {credentials.map((credential, index) => (
            <div
              key={index}
              className="rounded-md border border-border bg-card p-3 shadow-academic-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name={credential.icon as any} size={16} className="text-primary" />
                  <span className="font-caption text-xs font-semibold text-foreground">
                    {credential.role}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(credential, index)}
                  className="flex items-center space-x-1 rounded-md bg-primary/10 px-2 py-1 font-caption text-xs font-medium text-primary transition-academic hover:bg-primary/20"
                >
                  <Icon
                    name={copiedIndex === index ? 'CheckIcon' : 'ClipboardDocumentIcon'}
                    size={14}
                  />
                  <span>{copiedIndex === index ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-caption text-xs text-muted-foreground">E-mail:</span>
                  <code className="font-data text-xs text-foreground">{credential.email}</code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-caption text-xs text-muted-foreground">
                    Mot de passe:
                  </span>
                  <code className="font-data text-xs text-foreground">{credential.password}</code>
                </div>
              </div>
            </div>
          ))}
          <p className="font-caption text-xs text-muted-foreground">
            Utilisez ces identifiants pour tester les différents rôles de l'application.
          </p>
        </div>
      )}
    </div>
  );
};

export default DemoCredentials;