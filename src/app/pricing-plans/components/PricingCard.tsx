'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PricingCardProps {
  planName: string;
  price?: number;
  price_cents?: number;
  currency: string;
  billingPeriod: string;
  description: string;
  isRecommended?: boolean;
  isPopular?: boolean;
  onPurchase: (planName: string, price: number) => void;
  isProcessing: boolean;
}

const PricingCard = ({
  planName,
  price,
  price_cents,
  currency,
  billingPeriod,
  description,
  isRecommended = false,
  isPopular = false,
  onPurchase,
  isProcessing
}: PricingCardProps) => {
  const displayPrice = price !== undefined ? price : (price_cents ? price_cents / 100 : 0);
  const [isHovered, setIsHovered] = useState(false);

  // Split description by newline to create features
  const features = description.split('\n').filter(f => f.trim().length > 0);
  const actualRecommended = isRecommended || isPopular;

  const handlePurchase = () => {
    onPurchase(planName, displayPrice);
  };

  return (
    <div
      className={`relative flex flex-col rounded-lg border-2 bg-card p-8 shadow-academic transition-academic ${actualRecommended
        ? 'border-primary shadow-academic-lg'
        : 'border-border hover:border-primary/50'
        } ${isHovered ? '-translate-y-1 shadow-academic-xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center space-x-1 rounded-full bg-accent px-4 py-1 font-caption text-xs font-medium text-accent-foreground shadow-academic">
            <Icon name="SparklesIcon" size={14} />
            <span>Plus populairexx</span>
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 font-heading text-2xl font-bold text-foreground">
          {planName}
        </h3>
        {/* We don't show description here as it's now features */}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="font-heading text-5xl font-bold text-primary">
            {(displayPrice || 0).toFixed(2)}
          </span>

          <span className="ml-2 font-caption text-lg text-muted-foreground">
            {currency}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{billingPeriod}</p>
      </div>

      <button
        onClick={handlePurchase}
        disabled={isProcessing}
        className={`mb-6 flex w-full items-center justify-center space-x-2 rounded-md px-6 py-3 font-caption text-sm font-medium shadow-academic transition-academic hover:-translate-y-0.5 hover:shadow-academic-md disabled:cursor-not-allowed disabled:opacity-50 ${actualRecommended
          ? 'bg-primary text-primary-foreground'
          : 'bg-[#135ef2] text-secondary-foreground'
          }`}
      >
        {isProcessing ? (
          <>
            <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
            <span>Traitement...</span>
          </>
        ) : (
          <>
            <Icon name="ShoppingCartIcon" size={18} />
            <span>Acheter maintenant</span>
          </>
        )}
      </button>

      <div className="flex-1 space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Icon
              name="CheckCircleIcon"
              size={20}
              className="text-success"
            />
            <span className="font-caption text-sm text-foreground">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCard;
