'use client';

import { useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiMail } from 'react-icons/fi';

export default function Error({ error, reset }) {
  useEffect(() => {
  }, [error]);

  const handleRefresh = () => {
    reset();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleContact = () => {
    window.location.href = 'mailto:is.abdelalilabib@gmail.com';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <FiAlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-light mb-4">
            Oups ! Une erreur s'est produite
          </h1>
          <p className="text-primary/70 dark:text-light/70 mb-6 leading-relaxed">
            Une erreur inattendue s'est produite. Nous nous excusons pour la gêne occasionnée.
            Veuillez réessayer ou revenir à la page d'accueil.
          </p>
          
          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-primary/60 dark:text-light/60 hover:text-primary dark:hover:text-light">
                Détails de l'erreur (développement)
              </summary>
              <div className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto whitespace-pre-wrap">
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\nStack trace:\n'}
                      {error.stack}
                    </>
                  )}
                </pre>
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors font-medium"
          >
            <FiRefreshCw className="w-5 h-5" />
            Réessayer
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-primary/20 dark:border-light/20 text-primary dark:text-light hover:bg-primary/5 dark:hover:bg-light/5 rounded-lg transition-colors font-medium"
            >
              <FiHome className="w-4 h-4" />
              Accueil
            </button>
            
            <button
              onClick={handleContact}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-primary/20 dark:border-light/20 text-primary dark:text-light hover:bg-primary/5 dark:hover:bg-light/5 rounded-lg transition-colors font-medium"
            >
              <FiMail className="w-4 h-4" />
              Contact
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-primary/10 dark:border-light/10">
          <p className="text-sm text-primary/60 dark:text-light/60">
            Si le problème persiste, n'hésitez pas à me contacter.
          </p>
        </div>
      </div>
    </div>
  );
}
