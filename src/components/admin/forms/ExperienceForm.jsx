"use client";

import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

/**
 * A form for creating and editing professional and film experiences.
 * @param {{ initialData?: object, onSubmit: (data: object) => void, onCancel: () => void }} props
 */
const ExperienceForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    position: '',
    place: '',
    location: '',
    startYear: '',
    endYear: '',
    duration: '',
    achievements: [''],
    type: 'work',
    filmName: '',
    current: false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        position: initialData.position || '',
        place: initialData.place || initialData.company || '',
        location: initialData.location || '',
        startYear: initialData.startYear || '',
        endYear: initialData.endYear || '',
        duration: initialData.duration || '',
        achievements: Array.isArray(initialData.achievements) ? initialData.achievements : (initialData.achievements ? [initialData.achievements] : ['']),
        type: initialData.type || 'work',
        filmName: initialData.filmName || '',
        current: initialData.current || false,
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Validate years in real-time
    if (name === 'startYear' || name === 'endYear') {
      validateYears({ ...formData, [name]: value });
    }
  };

  const validateYears = (data) => {
    const newErrors = { ...errors };
    
    if (data.startYear && data.endYear) {
      const startYear = Number(data.startYear);
      const endYear = Number(data.endYear);
      
      if (endYear <= startYear) {
        newErrors.endYear = 'L\'année de fin doit être supérieure à l\'année de début';
      } else {
        delete newErrors.endYear;
      }
    } else {
      delete newErrors.endYear;
    }
    
    setErrors(newErrors);
  };

  const addAchievement = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ''] });
  };

  const removeAchievement = (index) => {
    if (formData.achievements.length > 1) {
      const newAchievements = formData.achievements.filter((_, i) => i !== index);
      setFormData({ ...formData, achievements: newAchievements });
    }
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate years before submission
    validateYears(formData);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0 && Object.values(errors).some(error => error)) {
      return;
    }
    
    setSaving(true);
    try {
      const dataToSubmit = { 
        ...formData, 
        achievements: formData.achievements.filter(a => a.trim()).map(a => a.trim()),
        startYear: Number(formData.startYear),
        endYear: formData.endYear ? Number(formData.endYear) : null
      };
      // Remove filmName if type is not film
      if (dataToSubmit.type !== 'film') {
        delete dataToSubmit.filmName;
      }
      await onSubmit(dataToSubmit);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-accent transition-colors";

  return (
  <div className="border border-primary/20 dark:border-light/20 rounded-xl p-4 sm:p-6 mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-primary dark:text-light">{initialData ? 'Modifier' : 'Ajouter'} Expérience</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="sm:col-span-2">
          <label htmlFor="type" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Type</label>
          <select name="type" value={formData.type} onChange={handleInputChange} className="admin-input" required>
            <option value="work">Professionnel</option>
            <option value="film">Filmographie</option>
          </select>
        </div>

        <div>
          <label htmlFor="position" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Poste</label>
          <input name="position" value={formData.position} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div>
          <label htmlFor="place" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">{formData.type === 'film' ? 'Production' : 'Entreprise/Institution'}</label>
          <input name="place" value={formData.place} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div>
          <label htmlFor="location" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Lieu</label>
          <input id="location" name="location" value={formData.location} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div>
          <label htmlFor="startYear" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Année de Début</label>
          <input id="startYear" name="startYear" type="number" value={formData.startYear} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div>
          <label htmlFor="endYear" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Année de Fin (optionnel)</label>
          <input id="endYear" name="endYear" type="number" value={formData.endYear} onChange={handleInputChange} className={`admin-input ${errors.endYear ? 'border-red-500' : ''}`} />
          {errors.endYear && (
            <p className="text-red-500 text-xs mt-1">{errors.endYear}</p>
          )}
        </div>

        <div>
          <label htmlFor="duration" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Durée</label>
          <input id="duration" name="duration" value={formData.duration} onChange={handleInputChange} className="admin-input" required />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="current"
            name="current"
            type="checkbox"
            checked={formData.current}
            onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
            className="w-4 h-4 text-accent border-primary/20 rounded focus:ring-accent focus:ring-2 dark:border-light/20"
          />
          <label htmlFor="current" className="text-xs sm:text-sm font-medium text-primary dark:text-light">
            Poste Actuel
          </label>
        </div>

        {formData.type === 'film' && (
          <div>
            <label htmlFor="filmName" className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Nom du Film</label>
            <input id="filmName" name="filmName" type="text" value={formData.filmName || ''} onChange={handleInputChange} className="admin-input" />
          </div>
        )}


        <div className="sm:col-span-2">
          <label className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Réalisations</label>
          <div className="space-y-3">
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => handleAchievementChange(index, e.target.value)}
                  className="admin-input text-sm sm:text-base"
                  required={index === 0}
                />
                {formData.achievements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAchievement}
              className="w-full px-3 py-2 border-2 border-dashed border-primary/30 dark:border-light/30 text-primary/70 dark:text-light/70 rounded-lg hover:border-accent hover:text-accent transition-colors text-sm"
            >
              + Ajouter une réalisation
            </button>
          </div>
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

export default ExperienceForm;
