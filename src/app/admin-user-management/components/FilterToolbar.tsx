'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterToolbarProps {
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

interface FilterState {
  subscriptionType: string;
  accountStatus: string;
  dateRange: string;
}

const FilterToolbar = ({ onFilterChange, totalResults }: FilterToolbarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    subscriptionType: 'Tous',
    accountStatus: 'Tous',
    dateRange: 'Tous',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      subscriptionType: 'Tous',
      accountStatus: 'Tous',
      dateRange: 'Tous',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== 'Tous').length;

  return (
    <div className="rounded-lg bg-card p-4 shadow-academic">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 font-caption text-sm font-medium text-primary-foreground transition-academic hover:shadow-academic-sm lg:hidden"
          >
            <Icon name="FunnelIcon" size={18} />
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="hidden items-center space-x-3 lg:flex">
            <select
              value={filters.subscriptionType}
              onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
              className="rounded-md border border-border bg-background px-4 py-2 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tous">Tous les abonnements</option>
              <option value="Gratuit">Gratuit</option>
              <option value="Basique">Basique</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
            <select
              value={filters.accountStatus}
              onChange={(e) => handleFilterChange('accountStatus', e.target.value)}
              className="rounded-md border border-border bg-background px-4 py-2 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Suspendu">Suspendu</option>
            </select>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="rounded-md border border-border bg-background px-4 py-2 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tous">Toutes les dates</option>
              <option value="7jours">7 derniers jours</option>
              <option value="30jours">30 derniers jours</option>
              <option value="90jours">90 derniers jours</option>
              <option value="1an">Cette année</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="font-caption text-sm text-muted-foreground">
            <span className="font-data font-semibold text-foreground">{totalResults}</span> résultats
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 rounded-md px-3 py-2 font-caption text-sm font-medium text-muted-foreground transition-academic hover:bg-muted hover:text-foreground"
            >
              <Icon name="XMarkIcon" size={16} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4 lg:hidden">
          <div>
            <label className="mb-1 block font-caption text-xs font-medium text-muted-foreground">
              Type d&apos;abonnement
            </label>
            <select
              value={filters.subscriptionType}
              onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
              className="w-full rounded-md border border-border bg-background px-4 py-2 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tous">Tous les abonnements</option>
              <option value="Gratuit">Gratuit</option>
              <option value="Basique">Basique</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block font-caption text-xs font-medium text-muted-foreground">
              Statut du compte
            </label>
            <select
              value={filters.accountStatus}
              onChange={(e) => handleFilterChange('accountStatus', e.target.value)}
              className="w-full rounded-md border border-border bg-background px-4 py-2 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block font-caption text-xs font-medium text-muted-foreground">
              Période d&apos;inscription
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full rounded-md border border-border bg-background px-4 py-2 font-caption text-sm text-foreground transition-academic focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Tous">Toutes les dates</option>
              <option value="7jours">7 derniers jours</option>
              <option value="30jours">30 derniers jours</option>
              <option value="90jours">90 derniers jours</option>
              <option value="1an">Cette année</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterToolbar;