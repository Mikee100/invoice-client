import React from 'react';

const Spinner = ({ 
  size = 'md', 
  color = 'indigo',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    indigo: 'border-indigo-500',
    white: 'border-white',
    gray: 'border-gray-500',
    red: 'border-red-500',
    green: 'border-green-500',
    blue: 'border-blue-500',
  };

  return (
    <div 
      className={`inline-block ${sizeClasses[size]} ${className} animate-spin rounded-full border-4 border-solid ${colorClasses[color]} border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default Spinner;
