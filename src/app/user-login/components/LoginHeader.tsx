import Icon from '@/components/ui/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Icon name="ArrowRightOnRectangleIcon" size={32} className="text-primary" />
        </div>
      </div>
      <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
        Connexion
      </h1>
      <p className="font-caption text-sm text-muted-foreground">
        Accédez à votre espace d'apprentissage personnalisé
      </p>
    </div>
  );
};

export default LoginHeader;