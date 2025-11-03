import React from 'react';

export const Layout = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export const Container = ({ children, className = '', size = 'default' }) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-8xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export const Section = ({ children, className = '', padding = 'default' }) => {
  const paddingClasses = {
    none: '',
    sm: 'py-6',
    default: 'py-8 md:py-12',
    lg: 'py-12 md:py-16',
    xl: 'py-16 md:py-24',
  };

  return (
    <section className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </section>
  );
};