'use client';

import Icon from '@/components/ui/AppIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
    info: 'bg-primary text-primary-foreground hover:bg-primary/90',
  };

  const iconStyles = {
    danger: 'text-destructive',
    warning: 'text-amber-500',
    info: 'text-primary',
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-2 ${variant === 'danger' ? 'bg-destructive/10' : variant === 'warning' ? 'bg-amber-100' : 'bg-primary/10'}`}>
              <Icon 
                name={variant === 'danger' ? 'ExclamationTriangleIcon' : variant === 'warning' ? 'ExclamationCircleIcon' : 'InformationCircleIcon'} 
                size={24} 
                className={iconStyles[variant]}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
          >
            {loading ? 'Chargement...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
