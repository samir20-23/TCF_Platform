import Icon from '@/components/ui/AppIcon';

const RegistrationBenefits = () => {
  const benefits = [
    {
      icon: 'AcademicCapIcon',
      title: 'Plans d\'étude exclusifs',
      description: 'Accédez à un parcours d\'apprentissage structuré conçu pour votre réussite au TCF',
    },
    {
      icon: 'VideoCameraIcon',
      title: 'Vidéos de leçons Premium',
      description: 'Apprenez avec des contenus vidéo détaillés et des stratégies d\'examen expertes',
    },
    {
      icon: 'DocumentTextIcon',
      title: 'Tests et simulations réels',
      description: 'Entraînez-vous avec des simulations fidèles aux conditions de l\'examen officiel',
    },
    {
      icon: 'ChartBarIcon',
      title: 'Analyses de performance',
      description: 'Identifiez vos points forts et progressez rapidement vers votre score cible',
    },
    {
      icon: 'ClockIcon',
      title: 'Accès flexible 24/7',
      description: 'Étudiez selon votre emploi du temps, avec un accès total à vos ressources',
    },
    {
      icon: 'SparklesIcon',
      title: 'Mises à jour prioritaires',
      description: 'Bénéficiez en continu des dernières nouveautés et ressources du TCF Canada',
    },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Pourquoi s'inscrire ?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Rejoignez des milliers d'étudiants qui préparent leur TCF Canada avec succès
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="rounded-lg bg-card p-4 shadow-academic-sm transition-academic hover:-translate-y-1 hover:shadow-academic"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Icon name={benefit.icon as any} size={24} className="text-accent" />
            </div>
            <h3 className="mb-2 font-caption text-sm font-semibold text-foreground">
              {benefit.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-primary/5 p-4 text-center">
        <p className="font-caption text-sm text-foreground">
          <Icon name="UserGroupIcon" size={18} className="mr-2 inline text-primary" />
          Plus de <span className="font-semibold text-primary">5 000 étudiants</span> nous font confiance
        </p>
      </div>
    </div>
  );
};

export default RegistrationBenefits;