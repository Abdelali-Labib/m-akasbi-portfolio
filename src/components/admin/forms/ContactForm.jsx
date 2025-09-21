"use client";

import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const ContactForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    href: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        value: initialData.value || '',
        href: initialData.href || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Auto-generate links based on contact type
  const generateAutoLink = (title, value) => {
    if (!value) return '';
    
    const lowerTitle = title.toLowerCase();
    
    // WhatsApp detection
    if (lowerTitle.includes('whatsapp') || lowerTitle.includes('téléphone') || lowerTitle.includes('phone')) {
      const cleanNumber = value.replace(/[^+\d]/g, '');
      if (cleanNumber) {
        return `https://wa.me/${cleanNumber.startsWith('+') ? cleanNumber.slice(1) : cleanNumber}`;
      }
    }
    
    // Email detection
    if (lowerTitle.includes('email') || lowerTitle.includes('mail') || value.includes('@')) {
      return `mailto:${value}`;
    }
    
    return '';
  };

  const getDisplayLink = () => {
    if (initialData) {
      return generateAutoLink(formData.title, formData.value) || formData.href;
    }
    return formData.href;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitData = {
        ...formData,
        href: initialData ? (generateAutoLink(formData.title, formData.value) || formData.href) : formData.href
      };
      await onSubmit(submitData);
    } finally {
      setSaving(false);
    }
  };


  return (
  <div className="border border-primary/20 dark:border-light/20 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6 text-primary dark:text-light">
        {initialData ? 'Modifier Contact' : 'Ajouter Contact'}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="admin-input"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="admin-input"
            required
          >
            <option value="">Sélectionnez un type</option>
            <option value="email">Email</option>
            <option value="phone">Téléphone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Valeur</label>
          <input
            type="text"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            required
            className="admin-input"
          />
        </div>


        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : (initialData ? 'Mettre à jour' : 'Ajouter')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="admin-cancel-button"
          >
            <FiX className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
