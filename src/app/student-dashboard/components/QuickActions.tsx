import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  label: string;
  href: string;
  icon: string;
  description: string;
}

const QuickActions = () => {
  const actions: QuickAction[] = [
    {
      label: 'Mon profil',
      href: '/user-profile',
      icon: 'UserCircleIcon',
      description: 'Gérer vos informations',
    },
    {
      label: 'Abonnement',
      href: '/pricing-plans',
      icon: 'CreditCardIcon',
      description: 'Gérer vos accès',
    },
    {
      label: 'Nos Plans',
      href: '/pricing-plans',
      icon: 'AcademicCapIcon',
      description: 'Découvrir nos offres',
    },
  ];

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic">
      <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Actions rapides
      </h2>

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-md border border-border p-4 transition-academic hover:border-primary hover:shadow-academic-sm"
          >
            <div className="mb-2 flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-3 transition-academic group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon name={action.icon as any} size={24} className="text-primary group-hover:text-primary-foreground" />
              </div>
            </div>
            <h3 className="mb-1 text-center font-caption text-sm font-medium text-foreground">
              {action.label}
            </h3>
            <p className="text-center text-caption text-xs text-muted-foreground">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;