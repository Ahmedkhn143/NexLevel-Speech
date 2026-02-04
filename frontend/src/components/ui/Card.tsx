import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export const Card = ({ children, className = '', hover = false, glass = false, ...props }: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                rounded-2xl p-6 bg-card border border-gray-800
                ${glass ? 'glass' : ''}
                ${hover ? 'hover:border-primary/50 hover:-translate-y-1 transition-all duration-300' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.div>
    );
};
