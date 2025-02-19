import React, { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'outline';
  [key: string]: any;
};

export const Button = ({ children, className = '', variant = 'primary', ...props }: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold transition-colors';
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};