"use client";

import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

/**
 * A form for creating and editing academic and certification formations.
 * @param {{ initialData?: object, onSubmit: (data: object) => void, onCancel: () => void }} props
 */
const FormationForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    speciality: '',
    year: '',
    type: 'academic',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || initialData.title || '',
        institution: initialData.institution || initialData.school || '',
        speciality: initialData.speciality || '',
        year: String(initialData.year || initialData.date || ''),
        type: initialData.type || 'academic',
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ ...formData, year: Number(formData.year) });
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-accent transition-colors";

  return (
  <div className="border border-primary/20 dark:border-light/20 rounded-xl p-4 sm:p-6 mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-primary dark:text-light">{initialData ? 'Modifier' : 'Ajouter'} Formation</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="sm:col-span-2">
          <label htmlFor="type" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Type</label>
          <select name="type" value={formData.type} onChange={handleInputChange} className="admin-input" required>
            <option value="academic">Académique</option>
            <option value="certificate">Certification</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Nom de la Formation</label>
          <input name="name" value={formData.name} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div>
          <label htmlFor="institution" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Institution</label>
          <input name="institution" value={formData.institution} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div>
          <label htmlFor="speciality" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Spécialité</label>
          <input name="speciality" value={formData.speciality} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div>
          <label htmlFor="year" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Année</label>
          <input id="year" name="year" type="number" value={formData.year} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : (initialData ? 'Mettre à Jour' : 'Sauvegarder')}
          </button>
          <button type="button" onClick={onCancel} className="admin-cancel-button">
            <FiX className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormationForm;
