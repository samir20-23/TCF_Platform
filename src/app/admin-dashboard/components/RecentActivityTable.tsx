interface Activity {
  id: number;
  userName: string;
  userEmail: string;
  action: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

interface RecentActivityTableProps {
  activities: Activity[];
}

const RecentActivityTable = ({ activities }: RecentActivityTableProps) => {
  const statusClasses = {
    success: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    failed: 'bg-error/10 text-error',
  };

  const statusLabels = {
    success: 'Réussi',
    pending: 'En attente',
    failed: 'Échoué',
  };

  return (
    <div className="overflow-hidden rounded-lg bg-card shadow-academic">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Activité récente
        </h3>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left font-caption text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left font-caption text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Action
              </th>
              <th className="px-6 py-3 text-left font-caption text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date et heure
              </th>
              <th className="px-6 py-3 text-left font-caption text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.map((activity) => (
              <tr key={activity.id} className="transition-academic hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-caption text-sm font-medium text-foreground">
                      {activity.userName}
                    </div>
                    <div className="font-caption text-xs text-muted-foreground">
                      {activity.userEmail}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-caption text-sm text-foreground">
                  {activity.action}
                </td>
                <td className="px-6 py-4 font-data text-sm text-muted-foreground">
                  {activity.timestamp}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 font-caption text-xs font-medium ${statusClasses[activity.status]}`}>
                    {statusLabels[activity.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="divide-y divide-border md:hidden">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="font-caption text-sm font-medium text-foreground">
                  {activity.userName}
                </div>
                <div className="font-caption text-xs text-muted-foreground">
                  {activity.userEmail}
                </div>
              </div>
              <span className={`inline-flex rounded-full px-2 py-1 font-caption text-xs font-medium ${statusClasses[activity.status]}`}>
                {statusLabels[activity.status]}
              </span>
            </div>
            <div className="font-caption text-sm text-foreground">
              {activity.action}
            </div>
            <div className="mt-1 font-data text-xs text-muted-foreground">
              {activity.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityTable;