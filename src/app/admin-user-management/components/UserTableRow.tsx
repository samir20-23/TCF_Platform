import Icon from '@/components/ui/AppIcon';

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
  onlineStatus?: { label: string; color: string; dot: string; isOnline: boolean };
}

interface UserTableRowProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onViewProfile: () => void;
  onManageSubscription: () => void;
  onToggleStatus: () => void;
  onUpdateRole: (newRole: 'admin' | 'student') => void;
  onEditUser?: () => void;
  onResetPassword?: () => void;
  onImpersonate?: () => void;
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

const UserTableRow = ({
  user,
  isSelected,
  onSelect,
  onViewProfile,
  onManageSubscription,
  onToggleStatus,
  onUpdateRole,
  onEditUser,
  onResetPassword,
  onImpersonate,
}: UserTableRowProps) => {
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
    <tr className="border-b border-border transition-academic hover:bg-muted/50">
      <td className="px-6 py-4">

      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 flex-shrink-0 overflow-hidden rounded-full flex items-center justify-center ${user.avatar ? '' : getAvatarColor(user.id)}`}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.avatarAlt}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Hide broken image and show initials instead
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
            <div className="flex items-center space-x-2">
              <p className="font-caption text-sm font-medium text-foreground">{user.name}</p>
              {user.onlineStatus && (
                <div className="flex items-center space-x-1" title={user.onlineStatus.label}>
                  <div className={`w-2 h-2 rounded-full ${user.onlineStatus.dot} animate-pulse`}></div>
                  {user.onlineStatus.isOnline && (
                    <span className={`text-[10px] font-bold ${user.onlineStatus.color}`}>{user.onlineStatus.label}</span>
                  )}
                  {!user.onlineStatus.isOnline && (
                    <span className={`text-[10px] font-medium text-gray-400`}>{user.onlineStatus.label}</span>
                  )}
                </div>
              )}
            </div>
            <p className="font-caption text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-data text-sm text-foreground">{user.registrationDate}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 font-caption text-xs font-medium ${subscriptionColors[user.subscriptionType as keyof typeof subscriptionColors] || 'bg-muted text-muted-foreground'
            }`}
        >
          {user.subscriptionType}
        </span>
        {user.expiry && user.expiry !== 'N/A' && (
          <p className="text-[10px] text-muted-foreground mt-1">Exp: {user.expiry}</p>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-center">
          <p className="font-data text-sm font-bold text-foreground">{user.lastScore || 'N/A'}</p>
          <p className="text-[10px] text-muted-foreground">Dernier score</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-data text-sm text-muted-foreground">{user.lastActivity}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 font-caption text-xs font-medium ${statusColors[user.status]
            }`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <select
            value={user.role}
            onChange={(e) => onUpdateRole(e.target.value as 'admin' | 'student')}
            className="rounded-md border border-border bg-background px-2 py-1 font-caption text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="student">Étudiant</option>
            <option value="admin">Administrateur</option>
          </select>

          <button
            onClick={onViewProfile}
            className="rounded-md p-1.5 text-primary transition-academic hover:bg-primary/10"
            aria-label={`Voir le profil de ${user.name}`}
            title="Voir le profil"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {onEditUser && (
            <button
              onClick={onEditUser}
              className="rounded-md p-1.5 text-amber-600 transition-academic hover:bg-amber-100"
              aria-label={`Modifier ${user.name}`}
              title="Modifier"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}

          <button
            onClick={onToggleStatus}
            className={`rounded-md p-1.5 transition-academic ${user.status === 'Actif'
              ? 'text-error hover:bg-error/10' : 'text-success hover:bg-success/10'
              }`}
            aria-label={`${user.status === 'Actif' ? 'Suspendre' : 'Réactiver'} ${user.name}`}
            title={user.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
          >
            {user.status === 'Actif' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M4.93 4.93l14.14 14.14" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
          </button>

          {/* 

          <button
            onClick={onImpersonate}
            className="rounded-md p-1.5 text-indigo-500 transition-academic hover:bg-indigo-50"
            title="Incarner (Impersonate)"
          >
            <Icon name="UserCircleIcon" size={16} />
          </button> */}

          {/* wsp bro */}

        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;
