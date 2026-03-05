import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export default function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
    return (
        <div
            className={`rounded-xl border border-border bg-card shadow-soft transition-all duration-200 ${hover ? 'hover:shadow-elevated hover:-translate-y-1 cursor-pointer' : 'hover:shadow-card'
                } ${paddingClasses[padding]} ${className}`}
        >
            {children}
        </div>
    );
}

/* Card sub-components for composition */
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`text-lg font-bold text-foreground ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}
