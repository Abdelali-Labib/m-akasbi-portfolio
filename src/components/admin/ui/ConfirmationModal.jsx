"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

/**
 * Reusable confirmation modal for destructive actions
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {function} props.onClose - Function to close modal
 * @param {function} props.onConfirm - Function to confirm action
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.type - Type of action ('delete', 'warning', 'info')
 * @param {boolean} props.loading - Whether action is in progress
 */
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmer l'action", 
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  type = "warning",
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <FiTrash2 className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <FiAlertTriangle className="w-6 h-6 text-amber-500" />;
      default:
        return <FiAlertTriangle className="w-6 h-6 text-accent" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'delete':
        return "bg-red-500 hover:bg-red-600 text-white";
      case 'warning':
        return "bg-amber-500 hover:bg-amber-600 text-white";
      default:
        return "bg-accent hover:bg-accent/90 text-white";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white dark:bg-primary rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-lg font-semibold text-primary dark:text-light">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 hover:bg-primary/10 dark:hover:bg-light/10 rounded transition-colors disabled:opacity-50"
            >
              <FiX className="w-5 h-5 text-primary dark:text-light" />
            </button>
          </div>

          {/* Message */}
          <p className="text-primary/80 dark:text-light/80 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-primary/10 dark:bg-light/10 text-primary dark:text-light rounded hover:bg-primary/20 dark:hover:bg-light/20 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded transition-colors disabled:opacity-50 flex items-center gap-2 ${getConfirmButtonClass()}`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default ConfirmationModal;
