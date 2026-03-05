'use client';

import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/common/PublicHeader';
import Icon from '@/components/ui/AppIcon';

export default function NotAuthorizedPage() {
  const router = useRouter();

  return (
    <>
      <PublicHeader />
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <Icon name="ShieldExclamationIcon" size={64} className="mx-auto mb-6 text-destructive" />
          <h1 className="mb-4 font-heading text-4xl font-bold text-foreground">
            Accès non autorisé
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => router.push('/student-dashboard')}
              className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Retour au tableau de bord
            </button>
            <button
              onClick={() => router.push('/landing-page')}
              className="rounded-md bg-muted px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted/80"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
