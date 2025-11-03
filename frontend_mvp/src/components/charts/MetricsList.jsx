import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

export const MetricsList = ({ items = [], title, className = '' }) => {
  const renderMetricIcon = (item) => {
    if (item.status === 'success' || item.status === 'ATINGIDA') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (item.status === 'warning' || item.status === 'PENDENTE') {
      return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    }
    if (item.status === 'error' || item.status === 'BAIXA') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <ChevronRight className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'ATINGIDA':
        return 'bg-green-50 border-green-200';
      case 'warning':
      case 'PENDENTE':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
      case 'BAIXA':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          {title}
        </h4>
      )}
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className={`
              flex items-center justify-between p-4 rounded-xl border transition-all duration-200 
              hover:shadow-soft hover:scale-[1.01] cursor-pointer
              ${getStatusColor(item.status)}
            `}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-shrink-0">
                {renderMetricIcon(item)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.name || item.label}
                </p>
                {item.subtitle && (
                  <p className="text-sm text-gray-600 truncate">
                    {item.subtitle}
                  </p>
                )}
                {item.percentual && (
                  <p className="text-xs text-gray-500">
                    {item.percentual}
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {item.value || item.vendas}
              </p>
              {item.secondaryValue && (
                <p className="text-sm text-gray-600">
                  {item.secondaryValue}
                </p>
              )}
              {item.meta && (
                <p className="text-xs text-gray-500">
                  Meta: {item.meta}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
};