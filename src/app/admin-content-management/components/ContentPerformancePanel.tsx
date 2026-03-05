'use client';

import Icon from '@/components/ui/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
}

interface ContentPerformancePanelProps {
  metrics: PerformanceMetric[];
  viewsData: Array<{ name: string; views: number }>;
  completionData: Array<{ name: string; rate: number }>;
}

const ContentPerformancePanel = ({
  metrics,
  viewsData,
  completionData,
}: ContentPerformancePanelProps) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'ArrowTrendingUpIcon';
      case 'down':
        return 'ArrowTrendingDownIcon';
      default:
        return 'MinusIcon';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card p-4 shadow-academic transition-academic hover:shadow-academic-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon name={metric.icon as any} size={20} className="text-primary" />
              </div>
              <div className={`flex items-center space-x-1 font-data text-xs font-medium ${getTrendColor(metric.trend)}`}>
                <Icon name={getTrendIcon(metric.trend) as any} size={14} />
                <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
              </div>
            </div>
            <div className="mt-3">
              <p className="font-data text-2xl font-semibold text-foreground">
                {metric.value}
              </p>
              <p className="mt-1 font-caption text-sm text-muted-foreground">
                {metric.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-academic">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Vues par section
          </h3>
          <button className="flex items-center space-x-1 rounded-md border border-border bg-background px-3 py-1.5 font-caption text-xs font-medium text-foreground transition-academic hover:bg-muted">
            <Icon name="ArrowDownTrayIcon" size={14} />
            <span>Exporter</span>
          </button>
        </div>
        <div className="h-64" aria-label="Graphique à barres des vues par section">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                stroke="var(--color-border)"
              />
              <YAxis
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                stroke="var(--color-border)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="views" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-academic">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Taux de complétion
          </h3>
          <div className="flex items-center space-x-2">
            <button className="rounded-md border border-border bg-background px-3 py-1.5 font-caption text-xs font-medium text-foreground transition-academic hover:bg-muted">
              7 jours
            </button>
            <button className="rounded-md bg-primary px-3 py-1.5 font-caption text-xs font-medium text-primary-foreground transition-academic">
              30 jours
            </button>
          </div>
        </div>
        <div className="h-64" aria-label="Graphique linéaire du taux de complétion">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                stroke="var(--color-border)"
              />
              <YAxis
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                stroke="var(--color-border)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-success)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-success)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ContentPerformancePanel;