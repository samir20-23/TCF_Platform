import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const LoginLinks = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Link
          href="/user-registration"
          className="inline-flex items-center space-x-1 font-caption text-sm text-primary transition-academic hover:underline"
        >
          <span>Mot de passe oublié ?</span>
          <Icon name="ArrowRightIcon" size={14} />
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-4 font-caption text-muted-foreground">
            Nouveau sur TCF Canada ?
          </span>
        </div>
      </div>

      <Link
        href="/user-registration"
        className="flex w-full items-center justify-center space-x-2 rounded-md border border-border bg-background px-6 py-3 font-caption text-sm font-medium text-foreground shadow-academic-sm transition-academic hover:-translate-y-0.5 hover:shadow-academic"
      >
        <Icon name="UserPlusIcon" size={18} />
        <span>Créer un compte</span>
      </Link>
    </div>
  );
};

export default LoginLinks;