'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  glow?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, glow = true, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {/* Glow effect on focus */}
          {glow && (
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta blur-sm opacity-0 transition-opacity duration-300"
              animate={{ opacity: isFocused ? 0.3 : 0 }}
            />
          )}
          
          {/* Icon */}
          {icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              isFocused ? 'text-neon-cyan' : 'text-muted-foreground'
            }`}>
              {icon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`
              relative w-full bg-surface border rounded-xl py-3 
              text-foreground placeholder:text-muted-foreground
              transition-all duration-300
              focus:outline-none focus:ring-0
              ${icon ? 'pl-11' : 'pl-4'}
              ${isPassword ? 'pr-12' : 'pr-4'}
              ${error 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-neon-cyan/50'
              }
              ${glow && isFocused ? 'shadow-[0_0_15px_rgba(0,255,255,0.15)]' : ''}
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        {/* Error message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-red-400"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  glow?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, glow = true, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {/* Glow effect on focus */}
          {glow && (
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta blur-sm opacity-0 transition-opacity duration-300"
              animate={{ opacity: isFocused ? 0.3 : 0 }}
            />
          )}
          
          <textarea
            ref={ref}
            className={`
              relative w-full bg-surface border rounded-xl py-3 px-4
              text-foreground placeholder:text-muted-foreground
              transition-all duration-300 resize-none
              focus:outline-none focus:ring-0
              ${error 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-neon-cyan/50'
              }
              ${glow && isFocused ? 'shadow-[0_0_15px_rgba(0,255,255,0.15)]' : ''}
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </div>
        
        {/* Error message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-sm text-red-400"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
