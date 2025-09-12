"use client";

import React from 'react';

/**
 * Enhanced loading spinner component for admin interface
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Size of spinner ('sm', 'md', 'lg', 'xl')
 * @param {boolean} props.overlay - Whether to show as full overlay
 * @param {string} props.variant - Visual variant ('default', 'dots', 'pulse')
 */
const LoadingSpinner = ({ 
  message = "Chargement...", 
  size = "md", 
  overlay = false, 
  variant = "default" 
}) => {
  const sizeClasses = {
    sm: { spinner: "w-4 h-4", text: "text-xs", container: "gap-2" },
    md: { spinner: "w-8 h-8", text: "text-sm", container: "gap-3" },
    lg: { spinner: "w-12 h-12", text: "text-base", container: "gap-4" },
    xl: { spinner: "w-16 h-16", text: "text-lg", container: "gap-5" }
  };

  const currentSize = sizeClasses[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`flex space-x-1 ${currentSize.container}`}>
            <div className={`${currentSize.spinner} bg-accent rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${currentSize.spinner} bg-accent rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${currentSize.spinner} bg-accent rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className="relative">
            <div className={`${currentSize.spinner} bg-accent rounded-full animate-ping absolute opacity-75`}></div>
            <div className={`${currentSize.spinner} bg-accent rounded-full animate-pulse`}></div>
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <div className={`${currentSize.spinner} border-4 border-primary/10 dark:border-light/10 rounded-full`}></div>
            <div className={`${currentSize.spinner} border-4 border-transparent border-t-accent border-r-accent rounded-full animate-spin absolute top-0 left-0`}></div>
          </div>
        );
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${currentSize.container}`}>
      {renderSpinner()}
      {message && (
        <div className="text-center">
          <p className={`text-primary dark:text-light font-medium ${currentSize.text}`}>
            {message}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-primary p-8 rounded-xl shadow-2xl border border-primary/10 dark:border-light/10">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {content}
    </div>
  );
};

export default LoadingSpinner;
