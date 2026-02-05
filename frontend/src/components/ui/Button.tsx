'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
    glow?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconRight,
    glow = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = `
        inline-flex items-center justify-center rounded-xl font-semibold 
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
    `;

    const variants = {
        primary: `
            bg-gradient-to-r from-blue-500 to-purple-600 text-white
            hover:from-blue-400 hover:to-purple-500
            hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
            focus-visible:ring-blue-500
            relative overflow-hidden
        `,
        secondary: `
            bg-gray-800/50 text-gray-100 border border-gray-700
            hover:bg-gray-700/50 hover:border-gray-600 hover:-translate-y-0.5
            hover:shadow-lg hover:shadow-gray-900/50
            focus-visible:ring-gray-500
            backdrop-blur-sm
        `,
        outline: `
            bg-transparent text-gray-100 border border-gray-600
            hover:bg-gray-800/30 hover:border-blue-500/50 hover:-translate-y-0.5
            focus-visible:ring-blue-500
        `,
        danger: `
            bg-red-500/10 text-red-400 border border-red-500/30
            hover:bg-red-500/20 hover:border-red-500/50 hover:-translate-y-0.5
            focus-visible:ring-red-500
        `,
        ghost: `
            bg-transparent text-gray-400
            hover:bg-gray-800/50 hover:text-white
            focus-visible:ring-gray-500
        `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-8 py-3.5 text-base gap-2.5',
    };

    const glowStyles = glow ? 'shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50' : '';

    return (
        <motion.button
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyles} ${className}`}
            disabled={loading || disabled}
            {...props}
        >
            {/* Shimmer effect for primary */}
            {variant === 'primary' && (
                <span className="absolute inset-0 overflow-hidden rounded-xl">
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                </span>
            )}

            {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : icon ? (
                <span className="flex-shrink-0">{icon}</span>
            ) : null}

            {children && <span className="relative">{children}</span>}

            {iconRight && !loading && (
                <span className="flex-shrink-0">{iconRight}</span>
            )}
        </motion.button>
    );
};
