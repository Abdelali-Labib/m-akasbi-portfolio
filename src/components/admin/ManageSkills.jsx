"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaCogs } from 'react-icons/fa';
import SkillForm from './SkillForm';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import { getCloudinaryUrl } from '@/Data/config';

const ManageSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, skill: null, loading: false });

  // Helper function to get skill icon URL
  const getSkillIconUrl = (iconPath) => {
    if (!iconPath) return null;
    
    // If it's already a full URL, use it directly
    if (iconPath.startsWith('http')) {
      return iconPath;
    }
    
    // If it's just a filename, convert to Cloudinary URL
    return getCloudinaryUrl(iconPath);
  };

  const fetchSkills = async () => {
    console.log('Fetching skills from component...');
    try {
      const response = await fetch('/api/admin/skills');
      const result = await response.json();
      console.log('Skills API response:', result);
      
      if (result.success) {
        console.log('Setting skills:', result.data);
        setSkills(result.data || []);
        setError('');
      } else {
        console.error('API error:', result.error);
        setError(result.error || 'Erreur lors du chargement des compétences');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Erreur lors du chargement des compétences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (currentSkill) {
        const response = await fetch('/api/admin/skills', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentSkill.id, ...formData })
        });
        if (!response.ok) throw new Error('Failed to update skill');
      } else {
        const response = await fetch('/api/admin/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to create skill');
      }
      await fetchSkills();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleAddNew = () => {
    setCurrentSkill(null);
    setIsFormVisible(true);
  };

  const handleEdit = (skill) => {
    setCurrentSkill(skill);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (skill) => {
    setDeleteModal({ isOpen: true, skill, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.skill) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/admin/skills?id=${deleteModal.skill.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete skill');
      await fetchSkills();
      setDeleteModal({ isOpen: false, skill: null, loading: false });
    } catch (error) {
      console.error('Error deleting skill:', error);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setCurrentSkill(null);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des compétences..." size="lg" variant="dots" />;
  }

  // Show message if no data exists
  if (!loading && skills.length === 0) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Compétences</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Gérez vos compétences techniques et professionnelles
          </p>
          <button onClick={handleAddNew} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FaPlus className="mr-2 inline" /> Ajouter une Compétence
          </button>
        </div>
        
        {isFormVisible && (
          <SkillForm 
            initialData={currentSkill}
            onSubmit={handleFormSubmit}
            onCancel={resetForm}
          />
        )}
        
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Aucune compétence trouvée. Commencez par ajouter votre première compétence.</p>
        </div>
      </div>
    );
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    const { category } = skill;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const SkillList = ({ title, skills }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-primary dark:text-light mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map(skill => {
          const iconUrl = getSkillIconUrl(skill.icon);
          
          return (
            <div key={skill.id} className="group border border-primary/20 dark:border-light/20 rounded-xl p-6 bg-white dark:bg-primary shadow-sm hover:shadow-lg transition-all duration-300 hover:border-accent/50">
              <div className="flex items-start gap-4 mb-4">
                {/* Skill Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  {iconUrl ? (
                    <img 
                      src={iconUrl} 
                      alt={skill.name} 
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${iconUrl ? 'hidden' : 'flex'} w-8 h-8 items-center justify-center`}>
                    <FaCogs className="w-6 h-6 text-accent" />
                  </div>
                </div>
                
                {/* Skill Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-primary dark:text-light mb-2 truncate">{skill.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-primary/70 dark:text-light/70">
                      <span>Niveau</span>
                      <span className="font-medium">{skill.level || skill.percentage}%</span>
                    </div>
                    <div className="w-full bg-primary/10 dark:bg-light/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-accent to-accent/80 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${skill.level || skill.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => handleEdit(skill)} 
                  className="flex-1 p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors text-sm font-medium"
                  title="Modifier"
                >
                  <FaEdit className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleDeleteClick(skill)}
                  className="flex-1 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                  title="Supprimer"
                >
                  <FaTrash className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Compétences</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Gérez vos compétences techniques et professionnelles
        </p>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <FaPlus className="mr-2 inline" /> Ajouter une Compétence
          </button>
        )}
      </div>

      {isFormVisible && (
        <SkillForm 
          initialData={currentSkill}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}

      {!isFormVisible && (
        <div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
          
          {!error && skills.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <FaCogs className="mx-auto h-12 w-12 mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune compétence trouvée</h3>
              <p className="text-gray-500 dark:text-gray-400">Commencez par ajouter votre première compétence.</p>
            </div>
          )}
          
          {!error && skills.length > 0 && Object.entries(groupedSkills).map(([category, skills]) => (
            <SkillList key={category} title={category} skills={skills} />
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, skill: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la compétence"
        message={`Êtes-vous sûr de vouloir supprimer la compétence "${deleteModal.skill?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ManageSkills;
