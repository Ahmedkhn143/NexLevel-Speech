'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'neon' | 'cyber' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = `
      relative inline-flex items-center justify-center gap-2 font-semibold
      rounded-xl transition-all duration-300 overflow-hidden
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    const variantStyles = {
      primary: `
        bg-gradient-to-r from-neon-cyan to-neon-magenta text-black
        hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]
      `,
      neon: `
        bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime text-black
        hover:shadow-[0_0_40px_rgba(0,255,255,0.3),0_0_40px_rgba(255,0,255,0.3)]
      `,
      cyber: `
        bg-transparent border border-neon-cyan text-neon-cyan
        hover:bg-neon-cyan hover:text-black
        hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]
      `,
      secondary: `
        bg-surface border border-white/10 text-foreground
        hover:border-white/20 hover:bg-surface-hover
      `,
      ghost: `
        bg-transparent text-muted-foreground
        hover:bg-white/5 hover:text-foreground
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-500 text-white
        hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]
      `,
    };

    return (
      <motion.button
        ref={ref}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        {...props}
      >
        {/* Shimmer effect for primary/neon variants */}
        {(variant === 'primary' || variant === 'neon') && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none group-hover:translate-x-full" />
        )}
        
        {/* Cyber variant hover fill */}
        {variant === 'cyber' && (
          <span className="absolute inset-0 bg-neon-cyan -translate-x-full hover:translate-x-0 transition-transform duration-300 -z-10" />
        )}
        
        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : icon ? (
            icon
          ) : null}
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
