"use client";

import React, { useState, useEffect } from 'react';

/**
 * A form for creating and editing academic and certification formations.
 * @param {{ initialData?: object, onSubmit: (data: object) => void, onCancel: () => void }} props
 */
const FormationForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    school: '',
    date: '',
    description: '',
    type: 'academic', // Default type
    order: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        school: initialData.school || initialData.institution || '',
        date: initialData.date || initialData.year || '',
        description: initialData.description || '',
        type: initialData.type || 'academic',
        order: initialData.order || 0,
      });
    } else {
      setFormData({
        title: '',
        school: '',
        date: '',
        description: '',
        type: 'academic',
        order: 0,
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, order: Number(formData.order) });
  };

    const inputClasses = "w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-accent transition-colors";

  return (
    <div className="border border-primary/20 dark:border-light/20 rounded-lg p-6 mb-8 bg-white dark:bg-primary">
      <h2 className="text-xl font-semibold mb-6 text-primary dark:text-light">{initialData ? 'Modifier' : 'Ajouter'} Formation</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="md:col-span-2">
          <label htmlFor="type" className="block text-sm font-medium mb-2 text-primary dark:text-light">Type</label>
          <select id="type" name="type" value={formData.type} onChange={handleInputChange} className={inputClasses}>
            <option value="academic">Académique</option>
            <option value="certification">Certification</option>
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-primary dark:text-light">Titre</label>
          <input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="ex: Master en Informatique" className={inputClasses} required />
        </div>

        <div>
          <label htmlFor="school" className="block text-sm font-medium mb-2 text-primary dark:text-light">École ou Institution</label>
          <input id="school" name="school" value={formData.school} onChange={handleInputChange} placeholder="ex: Université Harvard" className={inputClasses} required />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-2 text-primary dark:text-light">Date</label>
          <input id="date" name="date" value={formData.date} onChange={handleInputChange} placeholder="ex: 2020 - 2022" className={inputClasses} required />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium mb-2 text-primary dark:text-light">Ordre d'Affichage</label>
          <input id="order" name="order" type="number" value={formData.order} onChange={handleInputChange} placeholder="0" className={inputClasses} required />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium mb-2 text-primary dark:text-light">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Décrivez la formation..." className={`${inputClasses} min-h-[120px]`} rows="4" required />
        </div>

        <div className="md:col-span-2 flex items-center gap-3 pt-4">
          <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors">
            {initialData ? 'Mettre à Jour' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary/10 dark:bg-light/10 text-primary dark:text-light rounded hover:bg-primary/20 dark:hover:bg-light/20 transition-colors">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormationForm;
