import React from 'react';

const Spinner = ({ 
  size = 'medium', 
  color = 'blue', 
  className = '',
  fullScreen = false 
}) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const colors = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2 border-t-transparent
    ${sizes[size]} 
    ${colors[color]}
    ${className}
  `;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={spinnerClasses}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className={spinnerClasses}></div>;
};

export default Spinner;