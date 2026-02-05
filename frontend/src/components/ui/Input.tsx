'use client';

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, iconRight, helperText, className = '', type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        {label}
                    </label>
                )}

                <div className="relative group">
                    {icon && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        type={inputType}
                        className={`
                            w-full bg-gray-900/50 
                            border ${error ? 'border-red-500/50' : 'border-gray-700/50'} 
                            rounded-xl 
                            py-3.5 
                            ${icon ? 'pl-12' : 'pl-4'} 
                            ${isPassword || iconRight ? 'pr-12' : 'pr-4'}
                            text-gray-100 
                            placeholder:text-gray-500
                            focus:outline-none 
                            focus:border-blue-500/50 
                            focus:ring-2 
                            focus:ring-blue-500/20
                            focus:bg-gray-900/70
                            hover:border-gray-600/50
                            transition-all duration-200
                            font-medium
                            ${className}
                        `}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    )}

                    {iconRight && !isPassword && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            {iconRight}
                        </span>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-red-400 text-sm ml-1 flex items-center gap-1"
                        >
                            <span className="w-1 h-1 rounded-full bg-red-400" />
                            {error}
                        </motion.p>
                    )}
                    {helperText && !error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-500 text-sm ml-1"
                        >
                            {helperText}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    className={`
                        w-full bg-gray-900/50 
                        border ${error ? 'border-red-500/50' : 'border-gray-700/50'} 
                        rounded-xl 
                        py-3.5 px-4
                        text-gray-100 
                        placeholder:text-gray-500
                        focus:outline-none 
                        focus:border-blue-500/50 
                        focus:ring-2 
                        focus:ring-blue-500/20
                        focus:bg-gray-900/70
                        hover:border-gray-600/50
                        transition-all duration-200
                        font-medium
                        resize-none
                        min-h-[120px]
                        ${className}
                    `}
                    {...props}
                />

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-red-400 text-sm ml-1"
                        >
                            {error}
                        </motion.p>
                    )}
                    {helperText && !error && (
                        <p className="text-gray-500 text-sm ml-1">{helperText}</p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
