'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';
import UserStatsCard from './UserStatsCard';
import FilterToolbar from './FilterToolbar';
import BulkActionsBar from './BulkActionsBar';
import UserTableRow from './UserTableRow';
import UserTableMobileCard from './UserTableMobileCard';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import UserEditModal from './UserEditModal';

// Simple hash function for user IDs
const hashUserId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 8);
};

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarAlt: string;
  registrationDate: string;
  subscriptionType: string;
  plan_id?: string | null;
  lastActivity: string;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  role: 'admin' | 'student';
  expiry?: string;
  lastScore?: number | string;
  progress?: number;
  onlineStatus?: { label: string; color: string; dot: string; isOnline: boolean };
}

interface FilterState {
  subscriptionType: string;
  accountStatus: string;
  dateRange: string;
}

const UserManagementInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    subscriptionType: 'Tous',
    accountStatus: 'Tous',
    dateRange: 'Tous'
  });

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    currentStatus: string;
    action: 'status' | 'delete';
  }>({ isOpen: false, userId: '', currentStatus: '', action: 'status' });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });

  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user && isHydrated) {
      loadUsers();
    }
  }, [user, isHydrated]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Use the API endpoint which has proper admin auth checks
      const response = await fetch('/api/admin/users?limit=100');

      if (!response.ok) {
        let message = 'Failed to fetch users';
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            message = errorData.error;
          }
        } catch {
          // Non-JSON error response, keep default message
        }
        throw new Error(message);
      }

      const { users: apiUsers } = await response.json();

      const usersList: User[] = (apiUsers || []).map((profile: any) => {
        const createdAt = profile.created_at ? new Date(profile.created_at) : new Date();

        // Determine subscription type from subscriptions + plans (Basique/Premium/VIP) or fallback to Gratuit
        let subscriptionType: User['subscriptionType'] = 'Gratuit';
        const firstSub = (profile.subscriptions || [])[0];
        const planName = firstSub?.plan?.name as string | undefined;
        if (planName === 'Basique' || planName === 'Premium' || planName === 'VIP') {
          subscriptionType = planName;
        }

        // Normalize status to match UI labels
        let userStatus = (profile.status as string) || 'Actif';
        if (userStatus === 'active' || userStatus === 'Active') userStatus = 'Actif';
        if (userStatus === 'inactive' || userStatus === 'Inactive') userStatus = 'Inactif';
        if (userStatus === 'suspended' || userStatus === 'Suspended') userStatus = 'Suspendu';

        const displayName =
          (profile.name as string) ||
          (profile.email ? profile.email.split('@')[0] : '') ||
          'Utilisateur';

        // Calculate online status
        const lastActive = profile.updated_at ? new Date(profile.updated_at) : createdAt;
        const now = new Date();
        const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        let onlineStatus = { label: 'Hors ligne', color: 'text-gray-500', dot: 'bg-gray-400', isOnline: false };
        if (diffHours < 1) { // less than 1 hour -> online
          onlineStatus = { label: 'En ligne', color: 'text-green-600', dot: 'bg-green-500', isOnline: true };
        } else if (diffHours < 5) {
          onlineStatus = { label: 'Récemment actif', color: 'text-blue-500', dot: 'bg-blue-400', isOnline: false };
        } else if (diffHours < 24 * 7) {
          onlineStatus = { label: 'Actif cette semaine', color: 'text-gray-400', dot: 'bg-gray-300', isOnline: false };
        } else {
          onlineStatus = { label: 'Hors ligne', color: 'text-gray-400', dot: 'bg-gray-300', isOnline: false };
        }

        return {
          id: profile.id as string,
          name: displayName,
          email: profile.email || '',
          avatar: '',
          avatarAlt: `Photo de profil de ${displayName}`,
          registrationDate: createdAt.toLocaleDateString('fr-CA'),
          subscriptionType,
          plan_id: firstSub?.plan?.id || null,
          lastActivity: createdAt.toLocaleDateString('fr-CA'),
          status: userStatus as User['status'],
          role: (profile.role as User['role']) || 'student',
          expiry: profile.expiry ? new Date(profile.expiry).toLocaleDateString('fr-CA') : 'N/A',
          lastScore: profile.last_score !== null ? `${profile.last_score}` : 'N/A',
          progress: undefined,
        };
      });

      setUsers(usersList);
    } catch (error: any) {
      // Ignore AbortError noise
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) return;
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Nom', 'Email', 'Role', 'Status', 'Date Inscription', 'Abonnement', 'Expiration', 'Dernier Score'];
      const rows = filteredUsers.map(u => [
        u.name,
        u.email,
        u.role,
        u.status,
        u.registrationDate,
        u.subscriptionType,
        u.expiry || 'N/A',
        u.lastScore || 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `utilisateurs_tcf_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export CSV réussi');
    } catch (err) {
      toast.error("Erreur lors de l'export CSV");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Envoyer un e-mail de réinitialisation de mot de passe à cet utilisateur ?")) return;
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) toast.success("Email envoyé");
      else throw new Error("Erreur");
    } catch (err) {
      toast.error("Échec de l'envoi de l'email");
    }
  };

  const handleImpersonate = async (userId: string) => {
    toast.loading("Connexion en tant qu'utilisateur...");
    // Redirect to a special route or handle session swap
    // For now, just a placeholder as this requires Auth control
    setTimeout(() => {
      toast.dismiss();
      toast.error("Fonctionnalité d'incarnation en cours de déploiement");
    }, 1500);
  };

  // Show confirmation modal before toggling status
  const handleToggleStatusClick = (userId: string, currentStatus: string) => {
    setConfirmModal({
      isOpen: true,
      userId,
      currentStatus,
      action: 'status',
    });
  };

  // Actually toggle the status after confirmation
  const handleConfirmToggleStatus = async () => {
    const { userId, currentStatus } = confirmModal;
    try {
      setActionLoading(true);
      const newStatus = currentStatus === 'Actif' ? 'Suspendu' : 'Actif';

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      toast.success(`Statut changé en "${newStatus}"`);
      loadUsers();
      setConfirmModal({ isOpen: false, userId: '', currentStatus: '', action: 'status' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error toggling status:', errorMessage);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit modal
  const handleEditUser = (user: User) => {
    setEditModal({ isOpen: true, user });
  };

  // Save user edits
  const handleSaveUserEdit = async (data: { name: string; plan_ids: string[]; status: string; role: string }) => {
    if (!editModal.user) return;

    // Prevent self-lockout: keep current admin active and as admin
    if (editModal.user.id === user?.id) {
      if (data.status !== 'Actif' || data.role !== 'admin') {
        toast.error(
          'Attention: Vous ne pouvez pas désactiver ou rétrograder votre propre compte administrateur.',
        );
        return;
      }
    }

    try {
      setActionLoading(true);

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editModal.user.id,
          name: data.name,
          status: data.status,
          role: data.role,
          plan_ids: data.plan_ids,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${errorData.error}: ${errorData.details || ''}`);
      }

      toast.success('Utilisateur mis à jour');
      router.refresh();
      await loadUsers();
      setEditModal({ isOpen: false, user: null });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating user:', errorMessage);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  // Navigate to user profile
  const handleViewProfile = (userId: string) => {
    const hash = hashUserId(userId);
    router.push(`/admin/user/${hash}?uid=${userId}`);
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'student') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      toast.success('Rôle mis à jour');
      loadUsers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating role:', errorMessage);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubscription =
      filters.subscriptionType === 'Tous' ||
      user.subscriptionType === filters.subscriptionType;

    const matchesStatus =
      filters.accountStatus === 'Tous' ||
      user.status === filters.accountStatus;

    return matchesSearch && matchesSubscription && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof User];
    let bValue: any = b[sortColumn as keyof User];

    if (sortColumn === 'registrationDate' || sortColumn === 'lastActivity') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const usersPerPage = 10;
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Actif').length,
    premiumUsers: users.filter(u => u.subscriptionType === 'Premium' || u.subscriptionType === 'VIP').length,
    newThisMonth: users.filter(u => {
      const regDate = new Date(u.registrationDate);
      const now = new Date();
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length,
  };

  if (!isHydrated || loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Gestion des utilisateurs
          </h1>
          <p className="mt-2 font-body text-muted-foreground">
            Gérez et surveillez tous les utilisateurs de la plateforme
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <UserStatsCard
          title="Utilisateurs totaux"
          value={stats.totalUsers}
          change="+0%"
          trend="neutral"
          icon="UsersIcon"
        />
        <UserStatsCard
          title="Utilisateurs actifs"
          value={stats.activeUsers}
          change="+0%"
          trend="neutral"
          icon="CheckCircleIcon"
        />
        <UserStatsCard
          title="Abonnements Premium"
          value={stats.premiumUsers}
          change="+0%"
          trend="neutral"
          icon="StarIcon"
        />
        <UserStatsCard
          title="Nouveaux ce mois"
          value={stats.newThisMonth}
          change="+0%"
          trend="neutral"
          icon="UserPlusIcon"
        />
      </div>

      <div className="rounded-lg bg-card p-6 shadow-academic">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Icon
              name="MagnifyingGlassIcon"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <FilterToolbar onFilterChange={handleFilterChange} totalResults={filteredUsers.length} />
        </div>

        {selectedUsers.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedUsers.length}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedUsers([])}
          />
        )}

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left">

                </th>
                <th
                  className="cursor-pointer pb-3 text-left font-caption text-sm font-medium text-muted-foreground"
                  onClick={() => handleSort('name')}
                >
                  Utilisateur
                </th>
                <th
                  className="cursor-pointer pb-3 text-left font-caption text-sm font-medium text-muted-foreground"
                  onClick={() => handleSort('registrationDate')}
                >
                  Date d'inscription
                </th>
                <th
                  className="cursor-pointer pb-3 text-left font-caption text-sm font-medium text-muted-foreground"
                  onClick={() => handleSort('subscriptionType')}
                >
                  Abonnement & Exp.
                </th>
                <th
                  className="pb-3 text-center font-caption text-sm font-medium text-muted-foreground"
                >
                  Dernier Score
                </th>
                <th
                  className="cursor-pointer pb-3 text-left font-caption text-sm font-medium text-muted-foreground"
                  onClick={() => handleSort('lastActivity')}
                >
                  Dernière activité
                </th>
                <th
                  className="cursor-pointer pb-3 text-left font-caption text-sm font-medium text-muted-foreground"
                  onClick={() => handleSort('status')}
                >
                  Statut
                </th>
                <th className="pb-3 text-left font-caption text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((userItem) => (
                <UserTableRow
                  key={userItem.id}
                  user={userItem}
                  isSelected={selectedUsers.includes(userItem.id)}
                  onSelect={() => handleSelectUser(userItem.id, !selectedUsers.includes(userItem.id))}
                  onViewProfile={() => handleViewProfile(userItem.id)}
                  onManageSubscription={() => handleEditUser(userItem)}
                  onToggleStatus={() => handleToggleStatusClick(userItem.id, userItem.status)}
                  onUpdateRole={(newRole) => handleUpdateRole(userItem.id, newRole)}
                  onEditUser={() => handleEditUser(userItem)}
                  onResetPassword={() => handleResetPassword(userItem.id)}
                  onImpersonate={() => handleImpersonate(userItem.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {paginatedUsers.map((userItem) => (
            <UserTableMobileCard
              key={userItem.id}
              user={userItem}
              isSelected={selectedUsers.includes(userItem.id)}
              onSelect={() => handleSelectUser(userItem.id, !selectedUsers.includes(userItem.id))}
              onViewProfile={() => handleViewProfile(userItem.id)}
              onManageSubscription={() => handleEditUser(userItem)}
              onToggleStatus={() => handleToggleStatusClick(userItem.id, userItem.status)}
              onUpdateRole={(newRole) => handleUpdateRole(userItem.id, newRole)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <p className="font-caption text-sm text-muted-foreground">
              Affichage {startIndex + 1}-{Math.min(startIndex + usersPerPage, sortedUsers.length)} sur {sortedUsers.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-border px-3 py-1 font-caption text-sm text-foreground transition-academic hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border px-3 py-1 font-caption text-sm text-foreground transition-academic hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'status'}
        onClose={() => setConfirmModal({ isOpen: false, userId: '', currentStatus: '', action: 'status' })}
        onConfirm={handleConfirmToggleStatus}
        title={confirmModal.currentStatus === 'Actif' ? 'Suspendre l\'utilisateur ?' : 'Réactiver l\'utilisateur ?'}
        message={
          confirmModal.currentStatus === 'Actif'
            ? 'Cet utilisateur ne pourra plus se connecter à la plateforme. Vous pourrez le réactiver à tout moment.'
            : 'Cet utilisateur pourra à nouveau se connecter à la plateforme.'
        }
        confirmText={confirmModal.currentStatus === 'Actif' ? 'Suspendre' : 'Réactiver'}
        variant={confirmModal.currentStatus === 'Actif' ? 'danger' : 'info'}
        loading={actionLoading}
      />

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        onSave={handleSaveUserEdit}
        user={editModal.user}
        loading={actionLoading}
      />
    </div>
  );
};

export default UserManagementInteractive;
