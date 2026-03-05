import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface QuickActionButtonProps {
  label: string;
  description: string;
  icon: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

const QuickActionButton = ({ 
  label, 
  description, 
  icon, 
  href,
  variant = 'primary' 
}: QuickActionButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:shadow-academic-md',
    secondary: 'bg-[#135ef2] text-secondary-foreground hover:shadow-academic-md',
    accent: 'bg-accent text-accent-foreground hover:shadow-academic-md',
  };

  return (
    <Link
      href={href}
      className={`flex items-center space-x-4 rounded-lg p-6 shadow-academic transition-academic hover:-translate-y-0.5 ${variantClasses[variant]}`}
    >
      <div className="flex-shrink-0">
        <Icon name={icon as any} size={32} />
      </div>
      <div className="flex-1">
        <h4 className="font-heading text-lg font-semibold">
          {label}
        </h4>
        <p className="mt-1 font-caption text-sm opacity-90">
          {description}
        </p>
      </div>
      <Icon name="ChevronRightIcon" size={24} />
    </Link>
  );
};

export default QuickActionButton;