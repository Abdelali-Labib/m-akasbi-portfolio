"use client";

import React, { useState, useEffect } from 'react';

/**
 * A form for creating and editing professional and film experiences.
 * @param {{ initialData?: object, onSubmit: (data: object) => void, onCancel: () => void }} props
 */
const ExperienceForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    date: '',
    description: '',
    roles: '',
    type: 'Work',
    order: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        title: initialData.title || '',
        company: initialData.company || '',
        date: initialData.date || '',
        description: initialData.description || '',
        roles: Array.isArray(initialData.roles) ? initialData.roles.join(', ') : (initialData.roles || ''),
        type: initialData.type || 'Work',
        order: initialData.order || 0,
      });
    } else {
      setFormData({
        title: '',
        company: '',
        date: '',
        description: '',
        roles: '',
        type: 'Work',
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
    const dataToSubmit = { 
      ...formData, 
      roles: formData.roles.split(',').map(r => r.trim()),
      order: Number(formData.order)
    };
    onSubmit(dataToSubmit);
  };

    const inputClasses = "w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-accent transition-colors";

  return (
    <div className="border border-primary/20 dark:border-light/20 rounded-lg p-6 mb-8 bg-white dark:bg-primary">
      <h2 className="text-xl font-semibold mb-6 text-primary dark:text-light">{initialData ? 'Modifier' : 'Ajouter'} Expérience</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="md:col-span-2">
          <label htmlFor="type" className="block text-sm font-medium mb-2 text-primary dark:text-light">Type</label>
          <select id="type" name="type" value={formData.type} onChange={handleInputChange} className={inputClasses}>
            <option value="Work">Professionnel</option>
            <option value="Film">Cinéma</option>
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2 text-primary dark:text-light">Titre</label>
          <input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="ex: Ingénieur Logiciel" className={inputClasses} required />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-2 text-primary dark:text-light">Entreprise / Production</label>
          <input id="company" name="company" value={formData.company} onChange={handleInputChange} placeholder="ex: Google" className={inputClasses} required />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-2 text-primary dark:text-light">Date</label>
          <input id="date" name="date" value={formData.date} onChange={handleInputChange} placeholder="ex: 2022 - Présent" className={inputClasses} required />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium mb-2 text-primary dark:text-light">Ordre d'Affichage</label>
          <input id="order" name="order" type="number" value={formData.order} onChange={handleInputChange} placeholder="0" className={inputClasses} required />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="roles" className="block text-sm font-medium mb-2 text-primary dark:text-light">Rôles (séparés par des virgules)</label>
          <input id="roles" name="roles" value={formData.roles} onChange={handleInputChange} placeholder="ex: Frontend, Backend, DevOps" className={inputClasses} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium mb-2 text-primary dark:text-light">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Décrivez vos responsabilités et réalisations..." className={`${inputClasses} min-h-[120px]`} rows="4" required />
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

export default ExperienceForm;
