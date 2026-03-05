'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface SubscriptionGateProps {
  isLocked: boolean;
  requiredPlan?: string;
  children: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const SubscriptionGate = ({ 
  isLocked, 
  requiredPlan = 'Premium',
  children,
  showUpgradePrompt = true
}: SubscriptionGateProps) => {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50">
        {children}
      </div>
      
      {showUpgradePrompt && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="max-w-md rounded-lg bg-card p-8 text-center shadow-academic-lg">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-accent/10 p-4">
                <Icon name="LockClosedIcon" size={32} className="text-accent" />
              </div>
            </div>
            <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
              Contenu Premium
            </h3>
            <p className="mb-6 text-muted-foreground">
              Ce contenu nécessite un abonnement {requiredPlan} pour y accéder.
            </p>
            <Link
              href="/pricing-plans"
              className="inline-flex items-center space-x-2 rounded-md bg-primary px-6 py-3 font-caption text-sm font-medium text-primary-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md"
            >
              <Icon name="SparklesIcon" size={18} />
              <span>Mettre à niveau maintenant</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionGate;