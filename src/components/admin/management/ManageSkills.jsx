"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCogs, FaExclamationTriangle, FaTools, FaLightbulb, FaGlobe } from 'react-icons/fa';
import SkillForm from '../forms/SkillForm';
import ConfirmationModal from '../ui/ConfirmationModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FirestoreService } from '../../../lib/firestore-service';
import { getCloudinaryUrl } from '@/Data/config';
import { useAuth } from '../../../Providers/AuthContext';

const ManageSkills = () => {
  const { user, isAdmin } = useAuth();
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
      const token = await user?.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (currentSkill) {
        const response = await fetch('/api/admin/skills', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ id: currentSkill.id, ...formData })
        });
        if (!response.ok) throw new Error('Failed to update skill');
      } else {
        const response = await fetch('/api/admin/skills', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to create skill');
      }
      await fetchSkills();
      resetForm();
    } catch (error) {
      console.error('Error saving skill:', error);
      setError('Erreur lors de la sauvegarde.');
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

  const handleDelete = (skill) => {
    setDeleteModal({ isOpen: true, skill, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.skill) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/skills?id=${deleteModal.skill.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete skill');
      
      await fetchSkills();
      setDeleteModal({ isOpen: false, skill: null, loading: false });
    } catch (error) {
      console.error('Error deleting skill:', error);
      setError('Erreur lors de la suppression. Vérifiez vos permissions administrateur.');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-light mb-2">Gestion des Compétences</h1>
          <p className="text-primary/60 dark:text-light/60 text-base sm:text-lg mb-6">
            Gérez vos compétences techniques et professionnelles
          </p>
        </div>
        
        {isFormVisible && (
          <SkillForm 
            initialData={currentSkill}
            onSubmit={handleFormSubmit}
            onCancel={resetForm}
          />
        )}
        
        <div className="text-center py-16">
          <p className="text-primary/60 dark:text-light/60 mb-4 text-sm sm:text-base">Aucune compétence trouvée.</p>
        </div>
      </div>
    );
  }

  // Group skills by category with French labels and icons
  const categoryConfig = {
    'technical': { label: 'Outils Techniques', icon: FaTools },
    'comprehensive': { label: 'Compétences Générales', icon: FaLightbulb },
    'language': { label: 'Langues', icon: FaGlobe }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const config = categoryConfig[skill.category] || { label: skill.category, icon: FaCogs };
    const categoryKey = skill.category;
    
    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        label: config.label,
        icon: config.icon,
        skills: []
      };
    }
    acc[categoryKey].skills.push(skill);
    return acc;
  }, {});

  // Sort skills within each category by level (highest first)
  Object.keys(groupedSkills).forEach(category => {
    groupedSkills[category].skills.sort((a, b) => b.level - a.level);
  });

  const SkillList = ({ title, skills, icon: IconComponent }) => (
    <div className="mb-12">
      <h2 className="text-xl sm:text-2xl font-semibold text-primary dark:text-light mb-4 sm:mb-6 flex items-center gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center">
          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
        </div>
        {title}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {skills.map(skill => {
          const iconUrl = getSkillIconUrl(skill.icon);
          
          return (
            <div key={skill.id} className="group bg-light/50 dark:bg-primary/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-primary/10 dark:border-light/10 hover:border-primary/20 dark:hover:border-light/20 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                {/* Skill Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  {iconUrl ? (
                    <img 
                      src={iconUrl} 
                      alt={skill.name} 
                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${iconUrl ? 'hidden' : 'flex'} w-6 h-6 sm:w-8 sm:h-8 items-center justify-center`}>
                    <FaCogs className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
                  </div>
                </div>
                
                {/* Skill Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-primary dark:text-light mb-2 truncate">{skill.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm text-primary/70 dark:text-light/70">
                      <span>Niveau</span>
                      <span className="font-medium">{skill.level || skill.percentage}%</span>
                    </div>
                    <div className="w-full bg-primary/10 dark:bg-light/10 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-accent to-accent/80 h-1.5 sm:h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${skill.level || skill.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 justify-end">
                <button 
                  onClick={() => handleEdit(skill)} 
                  className="p-2 bg-light/90 dark:bg-primary/90 text-accent rounded-lg hover:bg-light dark:hover:bg-primary transition-colors shadow-sm"
                  title="Modifier"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(skill)}
                  className="p-2 bg-light/90 dark:bg-primary/90 text-red-500 rounded-lg hover:bg-light dark:hover:bg-primary transition-colors shadow-sm"
                  title="Supprimer"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-light/95 to-light/90 dark:from-primary dark:via-primary/95 dark:to-primary/90 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary dark:text-light mb-2">Gestion des Compétences</h1>
              <p className="text-primary/60 dark:text-light/60 text-sm sm:text-base lg:text-lg">
                Gérez vos compétences techniques et professionnelles
              </p>
            </div>
            {!isFormVisible && (
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
              >
                <FaPlus className="w-4 h-4" />
                Ajouter une Compétence
              </button>
            )}
          </div>
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
            <div className="bg-light dark:bg-primary border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
          
          {!error && skills.length === 0 && (
            <div className="bg-light/50 dark:bg-primary/50 backdrop-blur-sm rounded-2xl p-8 border border-primary/10 dark:border-light/10 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPlus className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-primary dark:text-light mb-2">Aucune compétence trouvée</h3>
                <p className="text-primary/60 dark:text-light/60 mb-6">Commencez par ajouter votre première compétence pour présenter vos talents.</p>
              </div>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
              >
                <FaPlus className="w-4 h-4" />
                Ajouter ma première compétence
              </button>
            </div>
          )}
          
          {!error && skills.length > 0 && Object.entries(groupedSkills).map(([category, categoryData]) => (
            <SkillList 
              key={category} 
              title={categoryData.label} 
              skills={categoryData.skills} 
              icon={categoryData.icon}
            />
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
    </div>
  );
};

export default ManageSkills;
