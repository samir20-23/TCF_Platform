'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Plan {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  subscriptionType: string;
  plan_ids?: string[];
  status: 'Actif' | 'Inactif' | 'Suspendu';
  role: 'admin' | 'student';
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; plan_ids: string[]; status: string; role: string }) => void;
  user: User | null;
  loading?: boolean;
}

const UserEditModal = ({
  isOpen,
  onClose,
  onSave,
  user,
  loading = false,
}: UserEditModalProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    plan_ids: [] as string[],
    status: 'Actif' as 'Actif' | 'Inactif' | 'Suspendu',
    role: 'student' as 'admin' | 'student',
  });
  const [initialPlanIds, setInitialPlanIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/plans')
        .then(res => res.json())
        .then(data => setPlans(data.plans || []))
        .catch(err => console.error('Error fetching plans:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      // Fetch user active subs to populate checkboxes
      fetch(`/api/admin/users?search=${user.email}`)
        .then(res => res.json())
        .then(data => {
          const found = (data.users || []).find((u: any) => u.id === user.id);
          const activePlans = (found?.subscriptions || [])
            .filter((s: any) => s.status === 'active')
            .map((s: any) => s.plan?.id);

          setFormData({
            name: user.name,
            plan_ids: activePlans,
            status: user.status,
            role: user.role,
          });
          setInitialPlanIds(activePlans);
        });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (JSON.stringify(formData.plan_ids.sort()) !== JSON.stringify(initialPlanIds.sort())) {
      setShowConfirm(true);
      return;
    }
    onSave(formData);
  };

  const handleConfirmSave = () => {
    setShowConfirm(false);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-background/80  backdrop-blur-sm" style={{ margin: "0" }}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Modifier l'utilisateur
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full rounded-md border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">
              Abonnements (Sélection multiple)
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2 p-3 border border-border rounded-lg max-h-40 overflow-y-auto">
              {plans.map(plan => {
                const isBought = initialPlanIds.includes(plan.id);
                return (
                  <label key={plan.id} className={`flex items-center space-x-2 cursor-pointer p-2 rounded transition-colors ${isBought ? 'bg-primary/10 border-primary/20 border' : 'hover:bg-muted'}`}>
                    <input
                      type="checkbox"
                      checked={formData.plan_ids.includes(plan.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...formData.plan_ids, plan.id]
                          : formData.plan_ids.filter(id => id !== plan.id);
                        setFormData({ ...formData, plan_ids: newIds });
                      }}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{plan.name}</span>
                      {isBought && <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Acheté / Actif</span>}
                    </div>
                  </label>
                );
              })}
              {plans.length === 0 && <p className="text-xs text-muted-foreground italic col-span-2">Aucun plan configuré.</p>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">L'étudiant verra les tests de tous les plans cochés.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="student">Étudiant</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[3100] flex items-center justify-center bg-background/80 backdrop-blur-sm" style={{ margin: "0" }}>
          <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-xl p-6">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Confirmer la modification</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir modifier les abonnements de cet utilisateur dans la base de données ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSave}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEditModal;
