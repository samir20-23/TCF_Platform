'use client';

import Icon from '@/components/ui/AppIcon';
import NotificationBadge from '@/components/common/NotificationBadge';

interface Alert {
  id: number;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const alertIcons = {
    error: 'ExclamationCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon',
  };

  const alertColors = {
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-primary',
  };

  const alertBgColors = {
    error: 'bg-error/10',
    warning: 'bg-warning/10',
    info: 'bg-primary/10',
  };

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Alertes administratives
        </h3>
        <NotificationBadge count={alerts.length} variant="error" size="md" />
      </div>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-lg bg-muted/30 p-4 text-center">
            <Icon name="CheckCircleIcon" size={32} className="mx-auto text-success" />
            <p className="mt-2 font-caption text-sm text-muted-foreground">
              Aucune alerte en attente
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border border-border p-4 transition-academic hover:shadow-academic-sm ${alertBgColors[alert.type]}`}
            >
              <div className="flex items-start space-x-3">
                <Icon 
                  name={alertIcons[alert.type] as any} 
                  size={20} 
                  className={alertColors[alert.type]} 
                />
                <div className="flex-1">
                  <h4 className="font-caption text-sm font-semibold text-foreground">
                    {alert.title}
                  </h4>
                  <p className="mt-1 font-caption text-xs text-muted-foreground">
                    {alert.message}
                  </p>
                  <p className="mt-2 font-data text-xs text-muted-foreground">
                    {alert.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;