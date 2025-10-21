import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-2',
    large: 'h-16 w-16 border-4',
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-t-blue-500 border-b-blue-500 border-gray-200`}
          style={{
            borderRightColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
};

export default LoadingSpinner;
