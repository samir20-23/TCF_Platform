import type { Metadata } from 'next';
import PublicHeader from '@/components/common/PublicHeader';
import PricingInteractive from './components/PricingInteractive';

export const metadata: Metadata = {
  title: 'Plans tarifaires - TCF Canada',
  description: 'Choisissez le plan de préparation TCF Canada qui correspond à vos besoins. Plans Basic, Premium et VIP avec accès à vie, tests blancs et support personnalisé.',
};

export default function PricingPlansPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <PricingInteractive />
      </main>
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="font-caption text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TCF Canada. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}