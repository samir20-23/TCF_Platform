'use client';

import Icon from '@/components/ui/AppIcon';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'error' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showZero?: boolean;
  icon?: string;
  onClick?: () => void;
}

const NotificationBadge = ({ 
  count, 
  max = 99,
  variant = 'default',
  size = 'md',
  showZero = false,
  icon,
  onClick
}: NotificationBadgeProps) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  const shouldShow = showZero || count > 0;

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    error: 'bg-error text-error-foreground',
    warning: 'bg-warning text-warning-foreground',
    success: 'bg-success text-success-foreground',
  };

  const sizeClasses = {
    sm: 'h-4 min-w-[1rem] text-[10px]',
    md: 'h-5 min-w-[1.25rem] text-xs',
    lg: 'h-6 min-w-[1.5rem] text-sm',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  if (!shouldShow && !icon) return null;

  return (
    <div className="relative inline-flex">
      {icon && (
        <button
          onClick={onClick}
          className="rounded-md p-2 text-foreground transition-academic hover:bg-muted"
          aria-label="Notifications"
        >
          <Icon name={icon as any} size={iconSizes[size]} />
        </button>
      )}
      {shouldShow && (
        <span
          className={`absolute -right-1 -top-1 flex items-center justify-center rounded-full px-1.5 font-data font-medium shadow-academic-sm transition-academic ${variantClasses[variant]} ${sizeClasses[size]}`}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;