import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EnterpriseChart = ({
  type = 'line',
  data,
  title,
  subtitle,
  realTime = false,
  dataQuality = 'excellent',
  onDataPointClick,
  className = '',
  height = 300
}) => {
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Update timestamp when data changes
  useEffect(() => {
    setLastUpdate(new Date());
  }, [data]);

  // Enterprise color palette
  const colors = {
    primary: 'rgba(59, 130, 246, 1)',
    primaryLight: 'rgba(59, 130, 246, 0.1)',
    secondary: 'rgba(16, 185, 129, 1)',
    secondaryLight: 'rgba(16, 185, 129, 0.1)',
    accent: 'rgba(245, 158, 11, 1)',
    accentLight: 'rgba(245, 158, 11, 0.1)',
    danger: 'rgba(239, 68, 68, 1)',
    dangerLight: 'rgba(239, 68, 68, 0.1)',
    gray: 'rgba(107, 114, 128, 1)',
    grayLight: 'rgba(107, 114, 128, 0.1)'
  };

  // Enterprise chart options
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              family: 'Inter, sans-serif',
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: {
            family: 'Inter, sans-serif',
            size: 13,
            weight: '600'
          },
          bodyFont: {
            family: 'Inter, sans-serif',
            size: 12
          },
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = typeof context.parsed.y === 'number' 
                ? context.parsed.y.toLocaleString() 
                : context.parsed.y;
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: type !== 'doughnut' ? {
        x: {
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
            borderColor: 'rgba(107, 114, 128, 0.2)'
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: 'rgba(107, 114, 128, 0.7)'
          }
        },
        y: {
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
            borderColor: 'rgba(107, 114, 128, 0.2)'
          },
          ticks: {
            font: {
              family: 'Inter, sans-serif',
              size: 11
            },
            color: 'rgba(107, 114, 128, 0.7)',
            callback: function(value) {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
              }
              return value;
            }
          }
        }
      } : {},
      onClick: onDataPointClick ? (event, elements) => {
        if (elements.length > 0) {
          const element = elements[0];
          onDataPointClick(element, data);
        }
      } : undefined,
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      }
    };

    // Line chart specific options
    if (type === 'line') {
      baseOptions.elements = {
        point: {
          radius: 4,
          hoverRadius: 6,
          backgroundColor: colors.primary,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        line: {
          tension: 0.4,
          borderWidth: 3
        }
      };
    }

    return baseOptions;
  };

  // Process data for enterprise styling
  const processChartData = () => {
    if (!data) return null;

    const processedData = { ...data };
    
    // Apply enterprise colors to datasets
    processedData.datasets = data.datasets.map((dataset, index) => {
      const colorKeys = Object.keys(colors);
      const colorIndex = index % colorKeys.length;
      const colorKey = colorKeys[colorIndex];
      
      const baseColor = colors[colorKey];
      const lightColor = colors[colorKey + 'Light'] || colors[colorKey].replace('1)', '0.1)');

      return {
        ...dataset,
        backgroundColor: type === 'line' ? lightColor : baseColor,
        borderColor: baseColor,
        borderWidth: type === 'line' ? 3 : 1,
        fill: type === 'line' ? true : false,
        pointBackgroundColor: baseColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4
      };
    });

    return processedData;
  };

  // Get data quality indicator
  const getQualityConfig = () => {
    const configs = {
      excellent: { color: 'text-green-600', bg: 'bg-green-50', text: 'Excellent' },
      good: { color: 'text-blue-600', bg: 'bg-blue-50', text: 'Good' },
      'needs-attention': { color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Needs Attention' }
    };
    return configs[dataQuality] || configs.good;
  };

  const qualityConfig = getQualityConfig();
  const processedData = processChartData();

  const renderChart = () => {
    if (!processedData) return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>;

    const chartProps = {
      data: processedData,
      options: getChartOptions(),
      ref: chartRef
    };

    switch (type) {
      case 'line':
        return <Line {...chartProps} />;
      case 'bar':
        return <Bar {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      default:
        return <Line {...chartProps} />;
    }
  };

  return (
    <div className={`dh-chart-container ${className}`}>
      {/* Chart Header */}
      <div className="dh-chart-title">
        <div>
          <h3 className="dh-heading-3">{title}</h3>
          {subtitle && <p className="dh-chart-subtitle">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Data Quality Indicator */}
          <div className={`dh-quality-badge ${dataQuality}`}>
            <div className={`w-2 h-2 rounded-full bg-current`}></div>
            <span>{qualityConfig.text}</span>
          </div>

          {/* Real-time Indicator */}
          {realTime && (
            <div className="dh-realtime-indicator">
              Live
            </div>
          )}

          {/* Last Update */}
          <span className="dh-caption">
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: `${height}px` }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {renderChart()}
      </div>

      {/* Chart Footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Data points: {data?.labels?.length || 0}</span>
          {onDataPointClick && (
            <span className="text-blue-600">Click points for details</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="dh-btn-secondary text-xs"
            onClick={() => {/* Export functionality */}}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseChart;