import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const LoadingState = ({ message = 'Carregando...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" className="text-primary-600 mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export const ProcessingAnimation = ({ steps = [], currentStep = 0 }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-6">
        <LoadingSpinner size="xl" className="text-primary-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
            {currentStep + 1}
          </div>
        </div>
      </div>
      
      {steps.length > 0 && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processando dados...
          </h3>
          <p className="text-gray-600 mb-4">
            {steps[currentStep] || 'Preparando...'}
          </p>
          
          <div className="flex space-x-1 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};