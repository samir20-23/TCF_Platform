'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SubscriptionData {
  name: string;
  value: number;
  color: string;
}

interface SubscriptionChartProps {
  data: SubscriptionData[];
}

const SubscriptionChart = ({ data }: SubscriptionChartProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg bg-card shadow-academic">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-muted"></div>
          <p className="mt-4 font-caption text-sm text-muted-foreground">
            Chargement du graphique...
          </p>
        </div>
      </div>
    );
  }

  const totalSubscriptions = data.reduce((sum, item) => sum + item.value, 0);
  const hasData = totalSubscriptions > 0 && data.length > 0;

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic">
      <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
        Distribution des abonnements
      </h3>
      {hasData ? (
        <div className="h-80" aria-label="Graphique de distribution des abonnements">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground font-caption text-sm">
              Aucun abonnement actif
            </p>
            <p className="text-muted-foreground font-caption text-xs mt-1">
              Les données apparaîtront ici quand des utilisateurs s'abonneront
            </p>
          </div>
        </div>
      )}
      {hasData && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}:</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionChart;
