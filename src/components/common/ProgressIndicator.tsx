'use client';

interface ProgressIndicatorProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
}

const ProgressIndicator = ({ 
  progress, 
  label, 
  showPercentage = true,
  size = 'md',
  variant = 'default'
}: ProgressIndicatorProps) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <span className="font-caption text-sm font-medium text-foreground">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-data text-sm font-medium text-muted-foreground">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-muted ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-academic ${variantClasses[variant]}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;