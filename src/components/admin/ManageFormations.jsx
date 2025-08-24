"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaGraduationCap, FaCertificate, FaExclamationTriangle } from 'react-icons/fa';
import FormationForm from './FormationForm';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';

/**
 * Main component for managing academic and certification formations.
 * Handles fetching, creating, updating, and deleting formations.
 */
const ManageFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentFormation, setCurrentFormation] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, formation: null, loading: false });

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/admin/formations');
      if (!response.ok) throw new Error('Failed to fetch formations');
      const result = await response.json();
      const data = result.data || result; // Handle both response formats
      setFormations(Array.isArray(data) ? data : []);
    } catch (error) {
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (currentFormation) {
        const response = await fetch('/api/admin/formations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentFormation.id, ...formData })
        });
        if (!response.ok) throw new Error('Failed to update formation');
      } else {
        const response = await fetch('/api/admin/formations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to create formation');
      }
      await fetchFormations();
      resetForm();
    } catch (error) {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleAddNew = () => {
    setCurrentFormation(null);
    setIsFormVisible(true);
  };

  const handleEdit = (form) => {
    setCurrentFormation(form);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (formation) => {
    setDeleteModal({ isOpen: true, formation, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.formation) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/admin/formations?id=${deleteModal.formation.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete formation');
      await fetchFormations();
      setDeleteModal({ isOpen: false, formation: null, loading: false });
    } catch (error) {
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setCurrentFormation(null);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des formations..." size="lg" variant="dots" />;
  }

  // Filter based on actual data structure - certifications have name "Certification Online"
  const certificationFormations = formations.filter(f => f.name === 'Certification Online').sort((a, b) => (a.order || 0) - (b.order || 0));
  const academicFormations = formations.filter(f => f.name !== 'Certification Online').sort((a, b) => (a.order || 0) - (b.order || 0));

  /**
   * Renders a list of formations with edit and delete controls.
   * @param {{title: string, formations: object[], icon: React.ElementType, handleEdit: (form: object) => void, handleDelete: (id: string) => void}} props
   */
  const FormationList = ({ title, formations, icon: Icon, handleEdit, handleDelete }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-primary dark:text-light mb-6 flex items-center gap-3">
        <Icon className="w-6 h-6 text-accent" />
        {title}
      </h2>
      <div className="space-y-6">
        {formations.map(form => (
          <div key={form.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{form.title}</h3>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div><strong>Institution:</strong> {form.institution}</div>
                  <div><strong>Année:</strong> {form.year}</div>
                  {form.description && (
                    <div><strong>Description:</strong> {form.description}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 ml-6">
                <button 
                  onClick={() => handleEdit(form)} 
                  className="p-2 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                  title="Modifier"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(form)}
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
  );

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Formations</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Gérez vos formations académiques et certifications
        </p>
        {!isFormVisible && (
          <button 
            onClick={handleAddNew} 
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <FaPlus className="w-5 h-5 mr-2 inline" /> Ajouter une Formation
          </button>
        )}
      </div>

      {isFormVisible && (
        <FormationForm 
          initialData={currentFormation}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}

      {!isFormVisible && formations.length === 0 && (
        <div className="text-center py-16">
          <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Aucune Formation Trouvée</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cliquez sur 'Ajouter une Formation' pour commencer.</p>
        </div>
      )}

      {!isFormVisible && (
        <div>
          <FormationList title="Académiques" formations={academicFormations} icon={FaGraduationCap} handleEdit={handleEdit} handleDelete={handleDeleteClick} />
          <FormationList title="Certifications" formations={certificationFormations} icon={FaCertificate} handleEdit={handleEdit} handleDelete={handleDeleteClick} />
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, formation: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la formation"
        message={`Êtes-vous sûr de vouloir supprimer la formation "${deleteModal.formation?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ManageFormations;
