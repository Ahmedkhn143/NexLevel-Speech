'use client';

import { forwardRef, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover3D?: boolean;
  glow?: boolean;
  glowColor?: 'cyan' | 'magenta' | 'lime';
  variant?: 'default' | 'glass' | 'solid';
  noBorder?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      hover3D = false,
      glow = false,
      glowColor = 'cyan',
      variant = 'default',
      noBorder = false,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const rotateX = useSpring(
      useTransform(mouseY, [-0.5, 0.5], [8, -8]),
      { stiffness: 150, damping: 20 }
    );
    const rotateY = useSpring(
      useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
      { stiffness: 150, damping: 20 }
    );
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hover3D) return;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    const glowColors = {
      cyan: 'from-neon-cyan/30 to-neon-cyan/10',
      magenta: 'from-neon-magenta/30 to-neon-magenta/10',
      lime: 'from-neon-lime/30 to-neon-lime/10',
    };

    const variantStyles = {
      default: 'bg-surface',
      glass: 'glass',
      solid: 'bg-background-secondary',
    };

    const borderStyles = noBorder ? '' : 'border border-white/10 hover:border-white/20';

    const CardComponent = hover3D ? motion.div : 'div';

    const cardContent = (
      <div
        ref={ref}
        className={`
          relative rounded-2xl overflow-hidden
          ${variantStyles[variant]}
          ${borderStyles}
          transition-colors duration-300
          ${className}
        `}
        {...(!hover3D ? props : {})}
      >
        {/* Glow effect */}
        {glow && (
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${glowColors[glowColor]} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
        )}
        
        {/* Top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Content */}
        <div className="relative p-6">
          {children}
        </div>
      </div>
    );

    if (hover3D) {
      return (
        <div
          ref={cardRef}
          className="perspective-container group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            style={{ 
              rotateX, 
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="will-change-transform"
          >
            {cardContent}
          </motion.div>
        </div>
      );
    }

    return <div className="group">{cardContent}</div>;
  }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`pb-4 border-b border-white/5 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

// Card Title
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-foreground ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

// Card Description
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

// Card Content
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

// Card Footer
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`pt-4 border-t border-white/5 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
