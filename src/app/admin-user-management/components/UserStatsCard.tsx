interface UserStatsCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

const UserStatsCard = ({ title, value, change, trend, icon }: UserStatsCardProps) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted-foreground',
  };

  const trendIcons = {
    up: 'ArrowTrendingUpIcon',
    down: 'ArrowTrendingDownIcon',
    neutral: 'MinusIcon',
  };

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic transition-academic hover:shadow-academic-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-caption text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground">{value}</p>
          <div className={`mt-2 flex items-center space-x-1 font-caption text-sm ${trendColors[trend]}`}>
            <span>{change}</span>
          </div>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <div className="text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCard;