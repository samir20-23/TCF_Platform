'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface SuccessModalProps {
  isOpen: boolean;
  planName: string;
  onClose: () => void;
}

const SuccessModal = ({ isOpen, planName, onClose }: SuccessModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push('/student-dashboard');
    }
  }, [isOpen, countdown, router]);

  if (!isHydrated) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-card p-8 text-center shadow-academic-xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Icon name="CheckCircleIcon" size={48} className="text-success" />
          </div>
        </div>

        <h2 className="mb-3 font-heading text-2xl font-bold text-foreground">
          Paiement réussi !
        </h2>

        <p className="mb-6 text-muted-foreground">
          Votre abonnement <span className="font-semibold text-foreground">{planName}</span> a été activé avec succès. Vous avez maintenant accès à tous les contenus de votre plan.
        </p>

        <div className="mb-6 rounded-lg bg-muted/50 p-4">
          <p className="font-caption text-sm text-muted-foreground">
            Redirection automatique dans{' '}
            <span className="font-data text-lg font-bold text-primary">{countdown}</span>{' '}
            secondes...
          </p>
        </div>

        <button
          onClick={() => {
            onClose(); // close modal first
            setTimeout(() => router.push('/student-dashboard'), 50);
          }}
          className="flex w-full items-center justify-center space-x-2 rounded-md bg-primary px-6 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md"
        >
          <Icon name="AcademicCapIcon" size={18} />
          <span>Accéder à mes cours</span>
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;