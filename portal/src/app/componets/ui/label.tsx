import React, { ReactNode } from 'react';

type LabelProps = {
  htmlFor: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
};

export const Label = ({ htmlFor, children, className = '', ...props }: LabelProps) => {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
};