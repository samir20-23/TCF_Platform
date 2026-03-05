interface RevenueData {
  period: string;
  amount: number;
  currency: string;
}

interface RevenueCardProps {
  data: RevenueData[];
}

const RevenueCard = ({ data }: RevenueCardProps) => {
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-lg bg-card p-6 shadow-academic">
      <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
        Résumé des revenus
      </h3>
      <div className="mb-4 rounded-lg bg-primary/10 p-4">
        <p className="font-caption text-sm text-muted-foreground">
          Revenu total
        </p>
        <p className="mt-1 font-heading text-3xl font-bold text-primary">
          {totalRevenue.toLocaleString('fr-CA')} CAD
        </p>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="font-caption text-sm text-foreground">
              {item.period}
            </span>
            <span className="font-data text-sm font-medium text-foreground">
              {item.amount.toLocaleString('fr-CA')} {item.currency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueCard;