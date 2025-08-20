import React from 'react';

const VARIANTS = {
  primary: 'bg-[#cf0e0f] hover:bg-red-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};

const Button = ({ variant = 'primary', className = '', children, ...props }) => {
  const base = 'rounded-xl font-semibold transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button className={`${base} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
