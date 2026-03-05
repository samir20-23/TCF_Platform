'use client';

import { Fragment } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ComparisonFeature {
  category: string;
  features: {
    name: string;
    bronze: boolean | string;
    silver: boolean | string;
    gold: boolean | string;
  }[];
}

interface ComparisonTableProps {
  comparisonData: ComparisonFeature[];
}

const ComparisonTable = ({ comparisonData }: ComparisonTableProps) => {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Icon name="CheckIcon" size={20} className="text-success mx-auto transition-transform duration-200 hover:scale-125" />
      ) : (
        <Icon name="XMarkIcon" size={20} className="text-muted-foreground mx-auto transition-transform duration-200 hover:scale-125" />
      );
    }
    return <span className="font-caption text-sm text-foreground">{value}</span>;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-academic transition-shadow hover:shadow-xl">
      <table className="min-w-[600px] md:min-w-full w-full">
        <thead className="bg-muted sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-left font-heading text-sm font-semibold text-foreground">
              Fonctionnalités
            </th>
            <th className="px-6 py-4 text-center font-heading text-sm font-semibold text-foreground">
              Bronze
            </th>
            <th className="px-6 py-4 text-center font-heading text-sm font-semibold text-primary">
              Silver
            </th>
            <th className="px-6 py-4 text-center font-heading text-sm font-semibold text-foreground">
              Gold
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.map((category, categoryIndex) => (
            <Fragment key={`category-${categoryIndex}`}>
              <tr className="border-b border-border bg-muted/50">
                <td colSpan={4} className="px-6 py-3 font-caption text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {category.category}
                </td>
              </tr>
              {category.features.map((feature, featureIndex) => (
                <tr
                  key={`feature-${categoryIndex}-${featureIndex}`}
                  className="border-b border-border transition-academic hover:bg-muted/20 hover:scale-[1.01] duration-200"
                >
                  <td className="px-6 py-4 font-caption text-sm text-foreground whitespace-nowrap">
                    {feature.name}
                  </td>
                  <td className="px-6 py-4 text-center">{renderCell(feature.bronze)}</td>
                  <td className="px-6 py-4 text-center bg-primary/5">{renderCell(feature.silver)}</td>
                  <td className="px-6 py-4 text-center">{renderCell(feature.gold)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;