"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
import ContactForm from './ContactForm';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';

const ManageContactInfo = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contact: null, loading: false });
  const [currentItem, setCurrentItem] = useState(null);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/admin/contact');
      const result = await response.json();
      if (result.success && result.data) {
        setContacts(result.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleAddNew = () => {
    setCurrentItem(null);
    setIsFormVisible(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (contact) => {
    setDeleteModal({ isOpen: true, contact, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.contact) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/admin/contact?id=${deleteModal.contact.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      await fetchContactInfo();
      setDeleteModal({ isOpen: false, contact: null, loading: false });
    } catch (error) {
      console.error('Error deleting contact:', error);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
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
      console.error('Error submitting form:', error);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Informations de Contact</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Gérez vos informations de contact et réseaux sociaux
          </p>
          <button onClick={handleAddNew} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FaPlus className="mr-2 inline" /> Ajouter une Information
          </button>
        </div>
        
        {isFormVisible && (
          <ContactForm 
            initialData={currentItem}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormVisible(false); setCurrentItem(null); }}
          />
        )}
        
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Aucune information de contact trouvée. Commencez par ajouter votre première information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Informations de Contact</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Gérez vos informations de contact et réseaux sociaux
        </p>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <FaPlus className="mr-2 inline" /> Ajouter une Information
          </button>
        )}
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Informations de Contact ({contacts.length})</h2>
          <div className="space-y-6">
            {contacts.map(contact => (
              <div key={contact.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{contact.title}</h3>
                    <div className="space-y-1 text-gray-600 dark:text-gray-400">
                      <div><strong>Type:</strong> {contact.type}</div>
                      <div><strong>Valeur:</strong> {contact.value}</div>
                      {contact.href && (
                        <div><strong>Lien:</strong> <a href={contact.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{contact.href}</a></div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 ml-6">
                    <button 
                      onClick={() => handleEdit(contact)} 
                      className="p-2 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                      title="Modifier"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(contact)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Supprimer"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contact: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le contact"
        message={`Êtes-vous sûr de vouloir supprimer le contact "${deleteModal.contact?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ManageContactInfo;
