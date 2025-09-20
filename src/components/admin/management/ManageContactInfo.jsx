"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
import ContactForm from '../forms/ContactForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const ManageContactInfo = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/admin/contact');
      const result = await response.json();
      if (result.success && result.data) {
        setContacts(result.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);


  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsFormVisible(true);
  };


  const handleFormSubmit = async (formData) => {
    try {
      if (currentItem) {
        const response = await fetch('/api/admin/contact', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentItem.id, ...formData })
        });
        if (!response.ok) throw new Error('Failed to update contact item');
      } else {
        const response = await fetch('/api/admin/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to create contact item');
      }
      await fetchContactInfo();
      setIsFormVisible(false);
      setCurrentItem(null);
    } catch (error) {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des contacts..." size="lg" variant="dots" />;
  }

  if (!loading && contacts.length === 0) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-light mb-2">Gestion des Informations de Contact</h1>
          <p className="text-primary/60 dark:text-light/60 text-base sm:text-lg mb-6">
            Gérez vos informations de contact et réseaux sociaux
          </p>
        </div>
        
        {isFormVisible && (
          <ContactForm 
            initialData={currentItem}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormVisible(false); setCurrentItem(null); }}
          />
        )}
        
        <div className="text-center py-16">
          <p className="text-primary/60 dark:text-light/60 mb-4 text-sm sm:text-base">Aucune information de contact trouvée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container space-y-8">
      <div className="mb-8">
        <h1 className="admin-title">Gestion des Informations de Contact</h1>
        <p className="admin-subtitle">
          Gérez vos informations de contact et réseaux sociaux
        </p>
      </div>

      {isFormVisible && (
        <ContactForm 
          initialData={currentItem}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormVisible(false); setCurrentItem(null); }}
        />
      )}

      {!isFormVisible && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-primary dark:text-light mb-4 sm:mb-6">Informations de Contact ({contacts.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {contacts.map(contact => (
              <div key={contact.id} className="group border border-primary/20 dark:border-light/20 rounded-xl p-4 sm:p-6 hover:border-accent/30 hover:shadow-lg transition-all duration-300 bg-light/30 dark:bg-primary/10 hover:bg-light/50 dark:hover:bg-primary/20">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-light mb-2">{contact.title}</h3>
                    <div className="space-y-1 text-primary/60 dark:text-light/60">
                      <div className="text-sm sm:text-base"><strong>Valeur:</strong> <span className="break-words">{contact.value}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:ml-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 justify-end sm:justify-start">
                    <button 
                      onClick={() => handleEdit(contact)} 
                      className="p-2 sm:p-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 hover:scale-105 transition-all duration-200 shadow-sm flex-shrink-0"
                      title="Modifier"
                    >
                      <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageContactInfo;
