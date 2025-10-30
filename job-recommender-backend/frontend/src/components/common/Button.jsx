import React from 'react';

const Button = ({ children, variant = 'primary', onClick, disabled, className = '' }) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;