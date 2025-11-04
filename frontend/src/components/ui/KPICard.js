import React, { useState, useEffect } from 'react';

const KPICard = ({ 
  title, 
  value, 
  previousValue, 
  unit = '', 
  trend = 'neutral',
  realTime = false,
  icon,
  className = '',
  onClick 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Smooth number animation
  useEffect(() => {
    if (typeof value === 'number' && value !== displayValue) {
      setIsAnimating(true);
      const duration = 1000; // 1 second animation
      const steps = 60; // 60fps
      const increment = (value - displayValue) / steps;
      let current = displayValue;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
          setDisplayValue(value);
          setIsAnimating(false);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, displayValue]);

  // Calculate trend percentage
  const trendPercentage = previousValue && previousValue !== 0 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : 0;

  // Determine trend color and icon
  const getTrendConfig = () => {
    if (trend === 'up' || trendPercentage > 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '↗️',
        label: 'increase'
      };
    } else if (trend === 'down' || trendPercentage < 0) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '↘️',
        label: 'decrease'
      };
    }
    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: '→',
      label: 'stable'
    };
  };

  const trendConfig = getTrendConfig();

  // Format large numbers
  const formatValue = (num) => {
    if (typeof num !== 'number') return num;
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num);
  };

  return (
    <div 
      className={`dh-kpi-card dh-interactive ${onClick ? 'dh-clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Real-time indicator */}
      {realTime && (
        <div className="dh-realtime-indicator absolute top-4 right-4">
          Live
        </div>
      )}

      {/* Header with icon and title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="dh-caption font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </h3>
          </div>
        </div>
      </div>

      {/* Main value with animation */}
      <div className="mb-4">
        <div className={`dh-heading-1 font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
          <span className="tabular-nums">
            {formatValue(displayValue)}
          </span>
          {unit && (
            <span className="dh-body text-gray-500 ml-1">{unit}</span>
          )}
        </div>
      </div>

      {/* Trend indicator */}
      {previousValue && (
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${trendConfig.bgColor}`}>
            <span className="text-sm">{trendConfig.icon}</span>
            <span className={`text-sm font-medium ${trendConfig.color}`}>
              {Math.abs(trendPercentage)}%
            </span>
          </div>
          <span className="dh-caption text-gray-500">
            vs período anterior
          </span>
        </div>
      )}

      {/* Loading animation overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default KPICard;