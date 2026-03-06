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
      className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 ${actualRecommended
        ? 'border-[#135ef2] shadow-md scale-105 lg:scale-110'
        : 'border-[#e5e7eb] hover:shadow-md'
        } ${isHovered && actualRecommended ? 'shadow-lg' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#135ef2] px-4 py-1 text-xs font-semibold text-white shadow-md">
            <Icon name="SparklesIcon" size={14} />
            <span>Plus populaire</span>
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-[#0f172a]">
          {planName}
        </h3>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-[#135ef2]">
            {(displayPrice || 0).toFixed(0)}
          </span>
          <span className="text-lg text-[#64748b]">
            {currency}
          </span>
        </div>
        <p className="mt-2 text-sm text-[#64748b]">{billingPeriod}</p>
      </div>

      <button
        onClick={handlePurchase}
        disabled={isProcessing}
        className={`mb-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${actualRecommended
          ? 'bg-[#135ef2] text-white hover:bg-[#1150cc] shadow-md hover:shadow-lg'
          : 'border border-[#e5e7eb] text-[#0f172a] hover:bg-[#f4f7f9]'
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
          <div key={index} className="flex items-start gap-3">
            <Icon
              name="CheckCircleIcon"
              size={20}
              className="text-[#16a34a] flex-shrink-0 mt-0.5"
            />
            <span className="text-sm text-[#0f172a]">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCard;
