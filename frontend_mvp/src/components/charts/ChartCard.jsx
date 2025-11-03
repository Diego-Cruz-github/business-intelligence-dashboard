import React from 'react';
import { Card, CardBody } from '../ui/Card';
import { MoreHorizontal, Download, Maximize2 } from 'lucide-react';

export const ChartCard = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  actions = true,
  ...props 
}) => {
  return (
    <Card className={`group ${className}`} {...props}>
      <CardBody className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Maximize2 className="h-4 w-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
        
        {/* Chart Content */}
        <div className="px-6 pb-6">
          <div className="chart-container">
            {children}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};