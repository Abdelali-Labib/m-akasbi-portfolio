"use client";

import React, { useState, useEffect } from 'react';

const SkillForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    category: 'Frontend',
    icon: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        level: 50,
        category: 'Frontend',
        icon: '',
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'level' ? parseInt(value, 10) : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="border border-primary/20 dark:border-light/20 rounded-lg p-6 mb-8 bg-white dark:bg-primary">
      <h2 className="text-xl font-semibold mb-6 text-primary dark:text-light">{initialData ? 'Modifier Compétence' : 'Ajouter Compétence'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Nom de la Compétence</label>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="React" className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Icône</label>
            <input name="icon" value={formData.icon} onChange={handleInputChange} placeholder="react" className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Catégorie</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
              <option value="Outils">Tools</option>
              <option value="Autres">Autres</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Niveau: {formData.level}%</label>
            <input type="range" name="level" min="0" max="100" value={formData.level} onChange={handleInputChange} className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer dark:bg-light/20" />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-4">
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors">{initialData ? 'Mettre à Jour' : 'Sauvegarder'}</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary/10 dark:bg-light/10 text-primary dark:text-light rounded hover:bg-primary/20 dark:hover:bg-light/20 transition-colors">Annuler</button>
          </div>
        </form>
    </div>
  );
};

export default SkillForm;
