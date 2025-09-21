"use client";

import React from 'react';

/**
 * Simple, spacious data renderer with clear sections.
 * @param {{data: object}} props - The data object to render.
 */
const DataRenderer = ({ data }) => {
  if (data === null || typeof data === 'undefined' || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-8 text-primary/60 dark:text-light/60">
        <p>Aucune donnée</p>
      </div>
    );
  }

  const renderValue = (value) => {
    if (typeof value === 'string') {
      if (value.startsWith('http')) {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {value}
          </a>
        );
      }
      return <span className="text-primary dark:text-light">{value}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="font-mono text-green-700 font-semibold">{value.toLocaleString()}</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-primary/20 text-primary/70'
        }`}>
          {value ? 'Activé' : 'Désactivé'}
        </span>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.every(item => typeof item === 'string')) {
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-primary/40 dark:text-light/40 text-sm mt-0.5">•</span>
                <span className="text-primary dark:text-light">{item}</span>
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="space-y-3">
          {value.map((item, index) => (
            <div key={index} className="p-3 bg-light/50 dark:bg-primary/50 rounded-lg">
              <div className="text-xs text-primary/60 dark:text-light/60 mb-2">Élément {index + 1}</div>
              {typeof item === 'object' ? (
                <DataRenderer data={item} />
              ) : (
                renderValue(item)
              )}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'object' && value !== null) {
      return <DataRenderer data={value} />;
    }
    
    return <span className="text-primary/60 dark:text-light/60 italic">Valeur non définie</span>;
  };

  return (
    <div className="space-y-6">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b border-primary/20 dark:border-light/20 pb-6 last:border-b-0">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-primary dark:text-light capitalize">
              {key.replace(/_/g, ' ')}
            </h3>
          </div>
          <div className="pl-4">
            {renderValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataRenderer;
