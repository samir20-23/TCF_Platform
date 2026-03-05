import Icon from '@/components/ui/AppIcon';
import ProgressIndicator from '@/components/common/ProgressIndicator';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'success' | 'warning';
}

const MetricCard = ({ icon, label, value, subtext, variant = 'default' }: MetricCardProps) => {
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic transition-academic hover:shadow-academic-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-full p-3 ${variantClasses[variant]}`}>
          <Icon name={icon as any} size={24} />
        </div>
      </div>
      <h3 className="mb-1 font-heading text-3xl font-bold text-foreground">{value}</h3>
      <p className="font-caption text-sm font-medium text-muted-foreground">{label}</p>
      {subtext && (
        <p className="mt-2 text-caption text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
};

interface ProgressMetricsProps {
  overallProgress: number;
  studyStreak: number;
  completedLessons: number;
  totalLessons: number;
  studyHours: number;
}

const ProgressMetrics = ({
  overallProgress,
  studyStreak,
  completedLessons,
  totalLessons,
  studyHours,
}: ProgressMetricsProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-card p-6 shadow-academic">
        <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
          Progression globale
        </h2>
        <ProgressIndicator
          progress={overallProgress}
          label="Complétion totale"
          size="lg"
          variant={overallProgress >= 75 ? 'success' : 'default'}
        />
        <p className="mt-4 text-center font-caption text-sm text-muted-foreground">
          {completedLessons} sur {totalLessons} leçons terminées
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          icon="FireIcon"
          label="Série d'étude"
          value={`${studyStreak} jours`}
          subtext="Continue comme ça!"
          variant="warning"
        />
        <MetricCard
          icon="ClockIcon"
          label="Heures d'étude"
          value={`${studyHours}h`}
          subtext="Ce mois-ci"
          variant="success"
        />
      </div>
    </div>
  );
};

export default ProgressMetrics;