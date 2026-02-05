'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
    glow?: boolean;
    gradient?: boolean;
    noPadding?: boolean;
}

export const Card = ({
    children,
    className = '',
    hover = false,
    glass = false,
    glow = false,
    gradient = false,
    noPadding = false,
    ...props
}: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
                rounded-2xl ${noPadding ? '' : 'p-6'} 
                border border-gray-800/80
                ${glass
                    ? 'bg-gray-900/40 backdrop-blur-xl'
                    : gradient
                        ? 'bg-gradient-to-br from-gray-900 to-gray-800/50'
                        : 'bg-gray-900/80'
                }
                ${hover
                    ? 'hover:border-blue-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer'
                    : ''
                }
                ${glow
                    ? 'shadow-lg shadow-blue-500/10 border-blue-500/20'
                    : ''
                }
                relative overflow-hidden
                ${className}
            `}
            {...props}
        >
            {/* Subtle gradient overlay on hover for premium feel */}
            {hover && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
            )}

            {/* Glow effect */}
            {glow && (
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

// Stat Card variant
export const StatCard = ({
    icon,
    label,
    value,
    change,
    changeType = 'neutral',
    className = '',
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    className?: string;
}) => {
    const changeColors = {
        positive: 'text-emerald-400',
        negative: 'text-red-400',
        neutral: 'text-gray-400',
    };

    return (
        <Card className={`relative overflow-hidden ${className}`} gradient>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8" />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-3">
                    <span className="text-gray-400 text-sm font-medium">{label}</span>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {change && (
                        <span className={`text-sm font-medium ${changeColors[changeType]}`}>
                            {change}
                        </span>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400">
                    {icon}
                </div>
            </div>
        </Card>
    );
};
