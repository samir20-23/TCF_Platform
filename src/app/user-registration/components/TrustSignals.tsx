import Icon from '@/components/ui/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'ShieldCheckIcon',
      title: 'Sécurité garantie',
      description: 'Vos données sont protégées par un cryptage de niveau bancaire',
    },
    {
      icon: 'LockClosedIcon',
      title: 'Confidentialité',
      description: 'Nous ne partageons jamais vos informations personnelles',
    },
    {
      icon: 'CheckBadgeIcon',
      title: 'Certification TCF',
      description: 'Contenu aligné sur les standards officiels du TCF Canada',
    },
  ];

  return (
    <div className="w-full max-w-md space-y-4">
      {trustFeatures.map((feature, index) => (
        <div
          key={index}
          className="flex items-start space-x-4 rounded-lg bg-card/50 p-4 shadow-academic-sm transition-academic hover:shadow-academic"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon name={feature.icon as any} size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-caption text-sm font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {feature.description}
            </p>
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-border bg-card p-4 text-center">
        <p className="font-caption text-xs text-muted-foreground">
          En créant un compte, vous acceptez nos{' '}
          <a href="#" className="text-primary hover:underline">
            Conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="#" className="text-primary hover:underline">
            Politique de confidentialité
          </a>
        </p>
      </div>
    </div>
  );
};

export default TrustSignals;