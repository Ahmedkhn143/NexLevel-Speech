import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    {label}
                </label>
            )}
            <input
                className={`input ${error ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''} ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};
