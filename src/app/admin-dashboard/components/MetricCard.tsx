interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
}

const MetricCard = ({ title, value, icon, highlight }: MetricCardProps) => {
  return (
    <div className={`rounded-lg bg-card p-6 shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md border-b-4 ${highlight ? 'border-primary' : 'border-transparent'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-caption text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className={`mt-2 font-heading text-3xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${highlight ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={icon} fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;