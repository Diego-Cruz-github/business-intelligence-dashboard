import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-400" />
    );
  };

  const getTrendColor = () => {
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className={`kpi-card ${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-primary-100 text-sm font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="kpi-value text-white mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-primary-100 text-sm mt-1">
              {subtitle}
            </p>
          )}
          
          {(trend || trendValue) && (
            <div className="flex items-center gap-1 mt-3">
              {getTrendIcon()}
              {trendValue && (
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="ml-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};