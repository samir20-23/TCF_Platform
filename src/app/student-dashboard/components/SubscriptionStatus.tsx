import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface SubscriptionStatusProps {
  planName: string;
  planType: 'Bronze' | 'Silver' | 'Gold';
  expiryDate?: string;
  daysRemaining?: number;
}

const SubscriptionStatus = ({
  planName,
  planType,
  expiryDate,
  daysRemaining,
}: SubscriptionStatusProps) => {
  const planColors = {
    Bronze: 'bg-primary/10 text-primary',
    Silver: 'bg-accent/10 text-accent',
    Gold: 'bg-success/10 text-success',
  };

  const planIcons = {
    Bronze: 'StarIcon',
    Silver: 'SparklesIcon',
    Gold: 'TrophyIcon',
  };

  const showUpgrade = planType === 'Bronze';

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Abonnement actuel
        </h2>
        <div className={`rounded-full p-2 ${planColors[planType]}`}>
          <Icon name={planIcons[planType] as any} size={20} />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-caption text-sm font-medium text-foreground">
            Plan {planName}
          </span>
          <span className={`rounded-full px-3 py-1 text-caption text-xs font-medium ${planColors[planType]}`}>
            {planType}
          </span>
        </div>

        {expiryDate && daysRemaining !== undefined && (
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center justify-between">
              <span className="text-caption text-xs text-muted-foreground">
                Expire le: {expiryDate}
              </span>
              <span className="font-data text-xs font-medium text-foreground">
                {daysRemaining} jours restants
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {showUpgrade && (
          <Link
            href="/pricing-plans"
            className="flex w-full items-center justify-center space-x-2 rounded-md bg-accent px-4 py-3 font-caption text-sm font-medium text-accent-foreground shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md"
          >
            <Icon name="SparklesIcon" size={16} />
            <span>Mettre à niveau</span>
          </Link>
        )}

        <Link
          href="/user-profile"
          className="flex w-full items-center justify-center space-x-2 rounded-md border border-border px-4 py-2 font-caption text-sm font-medium text-foreground transition-academic hover:bg-muted"
        >
          <Icon name="CreditCardIcon" size={16} />
          <span>Historique des paiements</span>
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionStatus;