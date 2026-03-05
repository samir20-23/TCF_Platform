'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

// 1. Updated Type to include all your new options
type PaymentProvider = 'stripe' | 'paypal' | 'Ria' | 'mymin' | 'Orange Money' | 'western';

interface PaymentModalProps {
  isOpen: boolean;
  planName: string;
  price: number;
  currency?: string; // Made optional with default in props
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: (provider: PaymentProvider) => void; // Updated here
}

const PaymentModal = ({
  isOpen,
  planName,
  price,
  currency = 'MAD',
  isProcessing,
  onClose,
  onConfirm
}: PaymentModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6 bg-muted/30">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Choisir le mode de paiement
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Box */}
          <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Plan sélectionné</p>
                <p className="text-lg font-bold text-foreground">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-2xl font-black text-primary">
                  {price.toLocaleString('fr-MA')} {currency}
                </p>
              </div>
            </div>
          </div>

          {/* Providers List */}
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Stripe */}
            <PaymentOption
              id="stripe"
              title="Carte Bancaire / Stripe"
              subtitle="Visa, Mastercard, etc."
              icon={<Icon name="CreditCardIcon" size={24} />}
              color="bg-indigo-600"
              selected={selectedProvider === 'stripe'}
              onClick={() => setSelectedProvider('stripe')}
            />

            {/* PayPal */}
            <PaymentOption
              id="paypal"
              title="PayPal"
              subtitle="Paiement via votre compte PayPal"
              icon={<Icon name="CurrencyDollarIcon" size={24} />}
              color="bg-blue-500"
              selected={selectedProvider === 'paypal'}
              onClick={() => setSelectedProvider('paypal')}
            />

            {/* Ria */}
            <PaymentOption
              id="Ria"
              title="Ria Money Transfer"
              subtitle="Paiement via votre compte Ria"
              imgSrc="/assets/iconsPayments/ria.png"
              selected={selectedProvider === 'Ria'}
              onClick={() => setSelectedProvider('Ria')}
            />

            {/* Orange Money */}
            <PaymentOption
              id="Orange Money"
              title="Orange Money"
              subtitle="Paiement via votre compte Orange Money"
              imgSrc="/assets/iconsPayments/orange.png"
              selected={selectedProvider === 'Orange Money'}
              onClick={() => setSelectedProvider('Orange Money')}
            />

            {/* Western Union */}
            <PaymentOption
              id="western"
              title="Western Union"
              subtitle="Paiement via Western Union"
              imgSrc="/assets/iconsPayments/western.png"
              selected={selectedProvider === 'western'}
              onClick={() => setSelectedProvider('western')}
            />
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              onClick={() => selectedProvider && onConfirm(selectedProvider)}
              disabled={!selectedProvider || isProcessing}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary px-6 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            >
              {isProcessing ? (
                <>
                  <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                  <span>Redirection en cours...</span>
                </>
              ) : (
                <>
                  <span>Payer maintenant</span>
                  <Icon name="ArrowRightIcon" size={20} />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 flex items-center justify-center space-x-1">
              <Icon name="LockClosedIcon" size={12} />
              <span>Vos informations de paiement sont sécurisées et cryptées.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Helper Component for UI consistency
const PaymentOption = ({ id, title, subtitle, icon, imgSrc, color, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/50'
      }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color || 'bg-muted'}`}>
        {imgSrc ? <img src={imgSrc} alt={title} className="w-8 h-8 object-contain" /> : <div className="text-white">{icon}</div>}
      </div>
      <div className="text-left">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
      </div>
    </div>
    {selected && <Icon name="CheckCircleIcon" size={22} className="text-primary shrink-0" />}
  </button>
);

export default PaymentModal;