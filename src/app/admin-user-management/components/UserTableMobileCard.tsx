interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarAlt: string;
  registrationDate: string;
  subscriptionType: string;
  lastActivity: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  role: 'admin' | 'student';
  expiry?: string;
  lastScore?: number | string;
  progress?: number;
}

interface UserTableMobileCardProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
  onManageSubscription: () => void;
  onToggleStatus: () => void;
  onUpdateRole: (newRole: 'admin' | 'student') => void;
}

// Generate initials for avatar fallback
const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Generate a color based on user ID for avatar background
const getAvatarColor = (id: string): string => {
  const colors = [
    'bg-primary',
    'bg-blue-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
};

const UserTableMobileCard = ({
  user,
  isSelected,
  onSelect,
  onViewProfile,
  onManageSubscription,
  onToggleStatus,
  onUpdateRole,
}: UserTableMobileCardProps) => {
  const subscriptionColors = {
    Gratuit: 'bg-muted text-muted-foreground',
    Basique: 'bg-primary/10 text-primary',
    Premium: 'bg-accent/10 text-accent',
    VIP: 'bg-success/10 text-success',
  };

  const statusColors = {
    Actif: 'bg-success/10 text-success',
    Inactif: 'bg-muted text-muted-foreground',
    Suspendu: 'bg-error/10 text-error',
  };

  return (
    <div className="rounded-lg bg-card p-4 shadow-academic">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
            aria-label={`Sélectionner ${user.name}`}
          />
          <div className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-full flex items-center justify-center ${user.avatar ? '' : getAvatarColor(user.id)}`}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.avatarAlt}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`text-sm font-semibold text-white ${user.avatar ? 'hidden' : ''}`}>
              {getInitials(user.name)}
            </span>
          </div>
          <div>
            <p className="font-caption text-sm font-medium text-foreground">{user.name}</p>
            <p className="font-caption text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="font-caption text-xs text-muted-foreground">Inscription</span>
          <span className="font-data text-xs text-foreground">{user.registrationDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-caption text-xs text-muted-foreground">Abonnement</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 font-caption text-xs font-medium ${subscriptionColors[user.subscriptionType as keyof typeof subscriptionColors] || 'bg-muted text-muted-foreground'
              }`}
          >
            {user.subscriptionType}
          </span>
        </div>
        {user.expiry && user.expiry !== 'N/A' && (
          <div className="flex items-center justify-between">
            <span className="font-caption text-xs text-muted-foreground">Expiration</span>
            <span className="font-data text-xs text-foreground">{user.expiry}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-caption text-xs text-muted-foreground">Dernier score</span>
          <span className="font-data text-xs font-bold text-foreground">{user.lastScore || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-caption text-xs text-muted-foreground">Dernière activité</span>
          <span className="font-data text-xs text-muted-foreground">{user.lastActivity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-caption text-xs text-muted-foreground">Statut</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 font-caption text-xs font-medium ${statusColors[user.status]
              }`}
          >
            {user.status}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end space-x-2 border-t border-border pt-3">
        <button
          onClick={onManageSubscription}
          className="rounded-md p-2 text-accent transition-academic hover:bg-accent/10"
          aria-label={`Gérer l'abonnement de ${user.name}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </button>
        <button
          onClick={onToggleStatus}
          className={`rounded-md p-2 transition-academic ${user.status === 'Actif'
            ? 'text-error hover:bg-error/10' : 'text-success hover:bg-success/10'
            }`}
          aria-label={`${user.status === 'Actif' ? 'Désactiver' : 'Activer'} ${user.name}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div >
  );
};

export default UserTableMobileCard;
