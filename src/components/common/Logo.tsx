'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
    href?: string;
    className?: string;
    size?: number;
}

const Logo = ({ href = '/', className = '', size = 48 }: LogoProps) => {
    return (
        <Link
            href={href}
            className={`flex items-center transition-academic hover:-translate-y-0.5 ${className}`}
        >
            
            <span className="ml-3 font-heading text-2xl font-bold text-primary">
                TCF Canada
            </span>
        </Link>
    );
};

export default Logo;
