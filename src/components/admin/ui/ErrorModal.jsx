"use client";

import React from 'react';
import { FiX, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

/**
 * Professional error modal component
 */
const ErrorModal = ({ isOpen, onClose, title, message, type = 'error' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FiAlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'error':
      default:
        return <FiXCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          button: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'error':
      default:
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          button: 'bg-red-500 hover:bg-red-600'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-light dark:bg-primary rounded-2xl shadow-2xl border border-primary/20 dark:border-light/20 max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b px-6 py-4`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-primary dark:text-light">
              {title || (type === 'warning' ? 'Attention' : 'Erreur')}
            </h3>
            <button
              onClick={onClose}
              className="ml-auto p-1 rounded-lg hover:bg-primary/10 dark:hover:bg-light/10 transition-colors"
            >
              <FiX className="w-5 h-5 text-primary/60 dark:text-light/60" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-primary/80 dark:text-light/80 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-primary/5 dark:bg-light/5 border-t border-primary/10 dark:border-light/10">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2 ${colors.button} text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg`}
            >
              Compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
