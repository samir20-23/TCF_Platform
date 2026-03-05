import Icon from '@/components/ui/AppIcon';

interface TrustSignal {
  icon: string;
  title: string;
  description: string;
}

interface TrustSignalsProps {
  signals: TrustSignal[];
}

const TrustSignals = ({ signals }: TrustSignalsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {signals.map((signal, index) => (
        <div
          key={index}
          className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon name={signal.icon as any} size={32} className="text-primary" />
          </div>
          <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
            {signal.title}
          </h3>
          <p className="text-sm text-muted-foreground">{signal.description}</p>
        </div>
      ))}
    </div>
  );
};

export default TrustSignals;