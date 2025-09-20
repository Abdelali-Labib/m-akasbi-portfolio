"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaGraduationCap, FaCertificate, FaExclamationTriangle } from 'react-icons/fa';
import FormationForm from '../forms/FormationForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmationModal from '../ui/ConfirmationModal';

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

  // Filter based on type field
  const certificationFormations = formations.filter(f => f.type === 'certificate').sort((a, b) => (a.order || 0) - (b.order || 0));
  const academicFormations = formations.filter(f => f.type === 'academic').sort((a, b) => (a.order || 0) - (b.order || 0));

  /**
   * Renders a list of formations with edit and delete controls.
   * @param {{title: string, formations: object[], icon: React.ElementType, handleEdit: (form: object) => void, handleDelete: (id: string) => void}} props
   */
  const FormationList = ({ title, formations, icon: Icon, handleEdit, handleDelete }) => (
    <div className="mb-12">
      <h2 className="text-xl sm:text-2xl font-semibold text-primary dark:text-light mb-4 sm:mb-6 flex items-center gap-3">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
        {title}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {formations.map(form => (
          <div key={form.id} className="group border border-primary/20 dark:border-light/20 rounded-xl p-4 sm:p-6 hover:border-accent/30 hover:shadow-lg transition-all duration-300 bg-light/30 dark:bg-primary/10 hover:bg-light/50 dark:hover:bg-primary/20">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-light mb-2">{form.name || form.title}</h3>
                <div className="space-y-1 text-primary/60 dark:text-light/60">
                  <div className="text-sm sm:text-base"><strong>Institution:</strong> <span className="break-words">{form.institution}</span></div>
                  <div className="text-sm sm:text-base"><strong>Spécialité:</strong> <span className="break-words">{form.speciality}</span></div>
                  <div className="text-sm sm:text-base"><strong>Année:</strong> {form.year}</div>
                </div>
              </div>
              <div className="flex gap-2 sm:ml-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 justify-end sm:justify-start">
                <button 
                  onClick={() => handleEdit(form)} 
                  className="p-2 sm:p-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 hover:scale-105 transition-all duration-200 shadow-sm flex-shrink-0"
                  title="Modifier"
                >
                  <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(form)}
                  className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg hover:scale-105 transition-all duration-200 shadow-sm flex-shrink-0"
                  title="Supprimer"
                >
                  <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="admin-container space-y-8">
      <div className="mb-8">
        <h1 className="admin-title">Gestion des Formations</h1>
        <p className="admin-subtitle">
          Gérez vos formations académiques et certifications
        </p>
        {!isFormVisible && (
          <button 
            onClick={handleAddNew} 
            className="px-4 sm:px-6 py-2 sm:py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm sm:text-base">
            <FaPlus className="w-4 h-4 mr-2 inline" /> Ajouter une Formation
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
        <div className="text-center py-12 bg-light/50 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-light/20">
          <FaExclamationTriangle className="w-12 h-12 text-primary/40 dark:text-light/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary dark:text-light mb-2">Aucune Formation Trouvée</h3>
          <p className="text-primary/60 dark:text-light/60 mt-2">Les formations n'ont pas encore été configurées.</p>
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
