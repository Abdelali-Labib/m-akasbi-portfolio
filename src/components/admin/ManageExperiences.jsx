"use client";

import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiBriefcase, FiFilm } from 'react-icons/fi';
import ExperienceForm from './ExperienceForm';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';

/**
 * Main component for managing professional and film experiences.
 * Handles fetching, creating, updating, and deleting experiences.
 */
const ManageExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, experience: null, loading: false });

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/admin/experiences');
      if (!response.ok) throw new Error('Failed to fetch experiences');
      const result = await response.json();
      const data = result.data || result; // Handle both response formats
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      
      if (currentExperience) {
        const response = await fetch('/api/admin/experiences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentExperience.id, ...formData })
        });
        if (!response.ok) throw new Error('Failed to update experience');
      } else {
        const response = await fetch('/api/admin/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to create experience');
        const result = await response.json();
      }
      
      await fetchExperiences();
      resetForm();
    } catch (error) {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleAddNew = () => {
    setCurrentExperience(null);
    setIsFormVisible(true);
  };

  const handleEdit = (exp) => {
    setCurrentExperience(exp);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (experience) => {
    setDeleteModal({ isOpen: true, experience, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.experience) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/admin/experiences?id=${deleteModal.experience.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete experience');
      await fetchExperiences();
      setDeleteModal({ isOpen: false, experience: null, loading: false });
    } catch (error) {
      console.error('Error deleting experience:', error);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setCurrentExperience(null);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des expériences..." size="lg" variant="dots" />;
  }

  const professionalExperiences = experiences.filter(e => e.type === 'Work').sort((a, b) => a.order - b.order);
  const filmExperiences = experiences.filter(e => e.type === 'Film').sort((a, b) => a.order - b.order);

  /**
   * Renders a list of experiences with edit and delete controls.
   * @param {{title: string, experiences: object[], icon: React.ElementType}} props
   */
  const ExperienceList = ({ title, experiences, icon: Icon }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-primary dark:text-light mb-6 flex items-center gap-3">
        <Icon className="w-6 h-6 text-accent" />
        {title}
      </h2>
      <div className="space-y-6">
        {experiences.map(exp => (
          <div key={exp.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{exp.title}</h3>
                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                  <div><strong>Entreprise:</strong> {exp.company}</div>
                  <div><strong>Période:</strong> {exp.date}</div>
                  {exp.roles && exp.roles.length > 0 && (
                    <div><strong>Rôles:</strong> {exp.roles.join(', ')}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 ml-6">
                <button 
                  onClick={() => handleEdit(exp)} 
                  className="p-2 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors"
                  title="Modifier"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(exp)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Supprimer"
                >
                  <FiTrash2 className="w-4 h-4" />
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Expériences</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Gérez vos expériences professionnelles et cinématographiques
        </p>
        {!isFormVisible && (
          <button 
            onClick={handleAddNew} 
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <FiPlus className="w-5 h-5 mr-2 inline" /> Ajouter une Expérience
          </button>
        )}
      </div>

      {isFormVisible && (
        <ExperienceForm 
          initialData={currentExperience}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}

      {!isFormVisible && experiences.length === 0 && (
        <div className="text-center py-16">
          <FiAlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Aucune Expérience Trouvée</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cliquez sur 'Ajouter une Expérience' pour commencer.</p>
        </div>
      )}

      {!isFormVisible && (
        <div>
          <ExperienceList title="Professionnelles" experiences={professionalExperiences} icon={FiBriefcase} /> 
          <ExperienceList title="Cinéma" experiences={filmExperiences} icon={FiFilm} /> 
        </div>
      )}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, experience: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'expérience"
        message={`Êtes-vous sûr de vouloir supprimer l'expérience "${deleteModal.experience?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ManageExperiences;
