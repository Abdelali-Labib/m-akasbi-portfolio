"use client";

import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiBriefcase, FiFilm, FiAlertTriangle } from 'react-icons/fi';
import ExperienceForm from '../forms/ExperienceForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmationModal from '../ui/ConfirmationModal';

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

  const professionalExperiences = experiences.filter(e => e.type === 'work').sort((a, b) => a.order - b.order);
  const filmExperiences = experiences.filter(e => e.type === 'film').sort((a, b) => a.order - b.order);

  /**
   * Renders a list of experiences with edit and delete controls.
   * @param {{title: string, experiences: object[], icon: React.ElementType}} props
   */
  const ExperienceList = ({ title, experiences, icon: Icon }) => (
    <div className="mb-12">
      <h2 className="text-xl sm:text-2xl font-semibold text-primary dark:text-light mb-4 sm:mb-6 flex items-center gap-3">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
        {title}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {experiences.map(exp => (
          <div key={exp.id} className="group border border-primary/20 dark:border-light/20 rounded-xl p-4 sm:p-6 hover:border-accent/30 hover:shadow-lg transition-all duration-300 bg-light/30 dark:bg-primary/10 hover:bg-light/50 dark:hover:bg-primary/20">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-light mb-2">{exp.position}</h3>
                <div className="space-y-1 text-primary/60 dark:text-light/60">
                  <div className="text-sm sm:text-base"><strong>{exp.type === 'film' ? 'Production:' : 'Lieu:'}</strong> <span className="break-words">{exp.place || exp.company}</span></div>
                  <div className="text-sm sm:text-base"><strong>Localisation:</strong> {exp.location}</div>
                  <div className="text-sm sm:text-base"><strong>Durée:</strong> {exp.duration || `${exp.startYear}${exp.endYear ? ` - ${exp.endYear}` : ' - En cours'}`}</div>
                  {exp.type === 'film' && exp.filmName && (
                    <div className="text-sm sm:text-base"><strong>Film:</strong> {exp.filmName}</div>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="text-sm sm:text-base"><strong>Réalisations:</strong> {exp.achievements.slice(0, 2).join(', ')}{exp.achievements.length > 2 ? '...' : ''}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 sm:ml-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 justify-end sm:justify-start">
                <button 
                  onClick={() => handleEdit(exp)} 
                  className="p-2 sm:p-2.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 hover:scale-105 transition-all duration-200 shadow-sm flex-shrink-0"
                  title="Modifier"
                >
                  <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(exp)}
                  className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg hover:scale-105 transition-all duration-200 shadow-sm flex-shrink-0"
                  title="Supprimer"
                >
                  <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
        <h1 className="admin-title">Gestion des Expériences</h1>
        <p className="admin-subtitle">
          Gérez vos expériences professionnelles et cinématographiques
        </p>
        {!isFormVisible && (
          <button 
            onClick={handleAddNew} 
            className="px-4 sm:px-6 py-2 sm:py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm sm:text-base">
            <FiPlus className="w-4 h-4 mr-2 inline" /> Ajouter une Expérience
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
        <div className="text-center py-12 bg-light/50 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-light/20">
          <FiAlertTriangle className="w-12 h-12 text-primary/40 dark:text-light/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary dark:text-light mb-2">Aucune Expérience Trouvée</h3>
          <p className="text-primary/60 dark:text-light/60 mt-2">Les expériences n'ont pas encore été configurées.</p>
        </div>
      )}

      {!isFormVisible && (
        <div>
          <ExperienceList title="Expériences" experiences={professionalExperiences} icon={FiBriefcase} /> 
          <ExperienceList title="Filmographie" experiences={filmExperiences} icon={FiFilm} /> 
        </div>
      )}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, experience: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'expérience"
        message={`Êtes-vous sûr de vouloir supprimer l'expérience "${deleteModal.experience?.position}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ManageExperiences;
