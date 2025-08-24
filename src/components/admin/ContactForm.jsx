"use client";

import React, { useState, useEffect } from 'react';

const ContactForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    value: '',
    href: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const contactTypes = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'location', label: 'Localisation' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'github', label: 'GitHub' },
    { value: 'website', label: 'Site Web' }
  ];

  return (
    <div className="border border-primary/20 dark:border-light/20 rounded-lg p-6 mb-8 bg-white dark:bg-primary">
      <h2 className="text-xl font-semibold mb-6 text-primary dark:text-light">
        {initialData ? 'Modifier Contact' : 'Ajouter Contact'}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light"
          >
            <option value="">Sélectionner un type</option>
            {contactTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Ex: Email Principal"
            className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Valeur</label>
          <input
            type="text"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            required
            placeholder="Ex: contact@example.com"
            className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Lien (optionnel)</label>
          <input
            type="url"
            name="href"
            value={formData.href}
            onChange={handleInputChange}
            placeholder="Ex: mailto:contact@example.com ou https://..."
            className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
          >
            {initialData ? 'Mettre à jour' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-primary/10 dark:bg-light/10 text-primary dark:text-light rounded hover:bg-primary/20 dark:hover:bg-light/20 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
