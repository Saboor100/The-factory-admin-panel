import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({ 
  children, 
  variant = 'info', 
  className = '', 
  onClose,
  title 
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 text-green-800 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    error: {
      container: 'bg-red-50 text-red-800 border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    warning: {
      container: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    },
    info: {
      container: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const config = variants[variant] || variants.info;
  const IconComponent = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.container} ${className} mb-4`}>
      <div className="flex items-start">
        <IconComponent className={`h-5 w-5 ${config.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${config.iconColor} hover:opacity-70`}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;