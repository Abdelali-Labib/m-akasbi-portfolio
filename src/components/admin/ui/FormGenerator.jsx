"use client";

import React from 'react';
import { FiPlus, FiTrash2, FiType, FiHash, FiToggleLeft, FiList, FiFolder } from 'react-icons/fi';

/**
 * A fully recursive form generator for nested objects and arrays.
 * @param {{ data: object, setData: function, path?: string[] }} props
 */
const FormGenerator = ({ data, setData, path = [] }) => {

  const handleValueChange = (currentPath, value) => {
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
      let current = newData;
      for (let i = 0; i < currentPath.length - 1; i++) {
        current = current[currentPath[i]];
      }
      current[currentPath[currentPath.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (currentPath) => {
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let current = newData;
      let parent = null;
      let lastKey = '';

      for (const key of currentPath) {
        parent = current;
        lastKey = key;
        current = current[key];
      }
      
      const newObject = current.length > 0 ? 
        Object.keys(current[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {}) :
        { newItem: '' }; // Default structure for new item in empty array

      parent[lastKey].push(newObject);
      return newData;
    });
  };

  const removeArrayItem = (currentPath, index) => {
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let current = newData;
       for (let i = 0; i < currentPath.length - 1; i++) {
        current = current[currentPath[i]];
      }
      current[currentPath[currentPath.length - 1]].splice(index, 1);
      return newData;
    });
  };

  const getFieldIcon = (value) => {
    if (typeof value === 'boolean') return <FiToggleLeft className="w-4 h-4" />;
    if (typeof value === 'number') return <FiHash className="w-4 h-4" />;
    if (Array.isArray(value)) return <FiList className="w-4 h-4" />;
    if (typeof value === 'object' && value !== null) return <FiFolder className="w-4 h-4" />;
    return <FiType className="w-4 h-4" />;
  };

  const renderField = (key, value, currentPath) => {
    const labelText = key.replace(/_/g, ' ');
    const fieldIcon = getFieldIcon(value);
    
    const label = (
      <label className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-light mb-3 capitalize">
        <span className="text-accent">{fieldIcon}</span>
        {labelText}
      </label>
    );

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="bg-white dark:bg-primary/30 p-4 rounded-xl border border-primary/10 dark:border-light/10 shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleValueChange(currentPath, e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                value ? 'bg-accent' : 'bg-primary/30 dark:bg-light/30'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  value ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`}></div>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-primary dark:text-light capitalize">{labelText}</span>
              <p className="text-xs text-primary/60 dark:text-light/60">
                {value ? 'Activé' : 'Désactivé'}
              </p>
            </div>
          </label>
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={key} className="bg-white dark:bg-primary/30 p-4 rounded-xl border border-primary/10 dark:border-light/10 shadow-sm">
          {label}
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) => handleValueChange(currentPath, parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-primary/20 dark:border-light/20 rounded-lg bg-light/50 dark:bg-primary/50 text-primary dark:text-light focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 font-mono"
              placeholder="Entrez un nombre..."
            />
            <FiHash className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/40 dark:text-light/40" />
          </div>
        </div>
      );
    }

    if (typeof value === 'string') {
      const isTextArea = value.length > 80 || value.includes('\n');
      return (
        <div key={key} className="bg-white dark:bg-primary/30 p-4 rounded-xl border border-primary/10 dark:border-light/10 shadow-sm">
          {label}
          {isTextArea ? (
            <textarea
              value={value}
              onChange={(e) => handleValueChange(currentPath, e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-primary/20 dark:border-light/20 rounded-lg bg-light/50 dark:bg-primary/50 text-primary dark:text-light focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 resize-none"
              placeholder="Entrez votre texte..."
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleValueChange(currentPath, e.target.value)}
              className="w-full px-4 py-3 border border-primary/20 dark:border-light/20 rounded-lg bg-light/50 dark:bg-primary/50 text-primary dark:text-light focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
              placeholder="Entrez du texte..."
            />
          )}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={key} className="bg-white dark:bg-primary/30 p-6 rounded-xl border border-primary/10 dark:border-light/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            {label}
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
              {value.length} élément{value.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-4">
            {value.map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/20 dark:to-transparent p-4 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded font-mono font-semibold">
                      #{index + 1}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => removeArrayItem(currentPath, index)} 
                      className="ml-auto p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Supprimer cet élément"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <FormGenerator data={item} setData={(updater) => {
                    const newArray = [...value];
                    newArray[index] = typeof updater === 'function' ? updater(item) : updater;
                    handleValueChange(currentPath, newArray);
                  }} path={[...currentPath, index]} />
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addArrayItem(currentPath)} 
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-accent/30 hover:border-accent/60 text-accent hover:bg-accent/5 rounded-lg transition-all duration-200 group"
            >
              <FiPlus className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
              Ajouter un élément à "{labelText}"
            </button>
          </div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="bg-white dark:bg-primary/30 p-6 rounded-xl border border-primary/10 dark:border-light/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            {label}
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-medium">
              {Object.keys(value).length} propriété{Object.keys(value).length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/20 dark:to-transparent p-4 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
            <FormGenerator data={value} setData={(updater) => {
              const newValue = typeof updater === 'function' ? updater(value) : updater;
              handleValueChange(currentPath, newValue);
            }} path={currentPath} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {Object.entries(data).map(([key, value]) => renderField(key, value, [...path, key]))}
    </div>
  );
};

export default FormGenerator;
