import React from 'react';

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
