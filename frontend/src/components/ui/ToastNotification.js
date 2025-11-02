import React, { useState, useEffect } from 'react';

const ToastNotification = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  title,
  action,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getToastConfig = () => {
    const configs = {
      success: {
        icon: '✓',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      error: {
        icon: '✕',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      },
      warning: {
        icon: '⚠',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      },
      info: {
        icon: 'ℹ',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      }
    };
    return configs[type] || configs.info;
  };

  if (!isVisible) return null;

  const config = getToastConfig();

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${className}
      `}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${config.iconBg} ${config.iconColor}
          `}>
            <span className="text-sm font-semibold">{config.icon}</span>
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            {title && (
              <h4 className="text-sm font-semibold mb-1">{title}</h4>
            )}
            <p className="text-sm">{message}</p>
            
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={`
                    text-sm font-medium underline hover:no-underline
                    ${config.iconColor}
                  `}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 ml-4 p-1 rounded-md hover:bg-white hover:bg-opacity-20
              ${config.iconColor} hover:${config.iconColor}
            `}
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="h-1 bg-white bg-opacity-20">
          <div
            className={`h-full ${config.iconColor.replace('text-', 'bg-')}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Provider Component
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose toast functions globally
  React.useEffect(() => {
    window.showToast = addToast;
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

// Helper functions for easy use
export const showSuccessToast = (message, options = {}) => {
  if (window.showToast) {
    window.showToast({ ...options, message, type: 'success' });
  }
};

export const showErrorToast = (message, options = {}) => {
  if (window.showToast) {
    window.showToast({ ...options, message, type: 'error' });
  }
};

export const showWarningToast = (message, options = {}) => {
  if (window.showToast) {
    window.showToast({ ...options, message, type: 'warning' });
  }
};

export const showInfoToast = (message, options = {}) => {
  if (window.showToast) {
    window.showToast({ ...options, message, type: 'info' });
  }
};

export { ToastProvider };
export default ToastNotification;