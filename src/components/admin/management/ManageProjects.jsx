"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaVideo, FaImages ,FaExclamationTriangle, FaProjectDiagram, FaGithub, FaExternalLinkAlt, FaYoutube, FaPlay } from 'react-icons/fa';
import ProjectForm from '../forms/ProjectForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmationModal from '../ui/ConfirmationModal';
import { getCloudinaryUrl } from '@/Data/config';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, project: null, loading: false });

  const getProjectImageUrl = (project) => {
    if (project.type === 'image' && project.img) {
      if (!project.img.startsWith('http')) {
        return getCloudinaryUrl(project.img);
      }
      return project.img;
    }
    
    if ((project.type === 'video' || project.type === 'playlist') && project.thumbnail) {
      return project.thumbnail;
    }
    
    if (project.img) {
      if (project.img.includes('img.youtube.com') || project.img.includes('i.ytimg.com')) {
        return project.img;
      }
      if (!project.img.startsWith('http')) {
        return getCloudinaryUrl(project.img);
      }
      return project.img;
    }
    
    return null;
  };

  const getProjectTypeInfo = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return { icon: FaYoutube, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' };
      case 'playlist':
        return { icon: FaPlay, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' };
      case 'image':
        return { icon: FaProjectDiagram, color: 'text-accent', bgColor: 'bg-accent/10' };
      default:
        return { icon: FaProjectDiagram, color: 'text-accent', bgColor: 'bg-accent/10' };
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data || []);
        setError('');
      } else {
        setError(result.error || 'Erreur lors du chargement des projets');
      }
    } catch (error) {
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (currentProject) {
        const response = await fetch('/api/admin/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentProject.id, ...formData })
        });
        if (!response.ok) throw new Error('Failed to update project');
      } else {
        const response = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, order: projects.length })
        });
        if (!response.ok) throw new Error('Failed to create project');
      }
      await fetchProjects();
      resetForm();
    } catch (error) {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleAddNew = () => {
    setCurrentProject(null);
    setIsFormVisible(true);
  };

  const handleEdit = (proj) => {
    setCurrentProject(proj);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (project) => {
    setDeleteModal({ isOpen: true, project, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.project) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`/api/admin/projects?id=${deleteModal.project.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete project');
      await fetchProjects();
      setDeleteModal({ isOpen: false, project: null, loading: false });
    } catch (error) {
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setCurrentProject(null);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des projets..." size="lg" variant="dots" />;
  }

  // Show message if no data exists
  if (!loading && projects.length === 0) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Projets</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Gérez vos projets et réalisations
          </p>
          <button onClick={handleAddNew} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FaPlus className="mr-2 inline" /> Ajouter un Projet
          </button>
        </div>
        
        {isFormVisible && (
          <ProjectForm 
            initialData={currentProject}
            onSubmit={handleFormSubmit}
            onCancel={resetForm}
          />
        )}
        
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Aucun projet trouvé. Commencez par ajouter votre premier projet.</p>
        </div>
      </div>
    );
  }

  const groupedProjects = {
    video: projects.filter(p => p.type === 'video'),
    playlist: projects.filter(p => p.type === 'playlist'),
    image: projects.filter(p => p.type === 'image')
  };

  const renderProjectSection = (projectType, projectList, title, icon, iconColor, bgColor) => {
    if (projectList.length === 0) return null;

    const IconComponent = icon;
    
    return (
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center border border-accent/30`}>
            <IconComponent className={`h-6 w-6 ${iconColor}`} />
          </div>
          <h3 className="text-2xl font-bold text-primary dark:text-light">
            {title} <span className="text-accent">({projectList.length})</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectList.map(proj => {
            const typeInfo = getProjectTypeInfo(proj.type);
            const TypeIcon = typeInfo.icon;
            const imageUrl = getProjectImageUrl(proj);
            
            return (
              <div key={proj.id} className="group border border-primary/20 dark:border-light/20 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-accent/50">
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={proj.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                    <div className="text-center">
                      <TypeIcon className={`mx-auto h-12 w-12 mb-2 ${typeInfo.color}`} />
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Pas d'image</span>
                    </div>
                  </div>
                  
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color} backdrop-blur-sm`}>
                    <TypeIcon className="inline w-3 h-3 mr-1" />
                    {proj.type || 'Projet'}
                  </div>
                  
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleEdit(proj)} 
                      className="p-2 text-accent rounded-lg transition-colors shadow-sm"
                      title="Modifier"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(proj)}
                      className="p-2 text-red-500 rounded-lg transition-colors shadow-sm"
                      title="Supprimer"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-primary dark:text-light mb-2 line-clamp-2">{proj.title}</h3>
                  
                  {proj.description && (
                    <p className="text-primary/70 dark:text-light/70 text-sm mb-4 line-clamp-3">{proj.description}</p>
                  )}
                  
                  {/* Technologies */}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.slice(0, 4).map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md font-medium">
                            {tech}
                          </span>
                        ))}
                        {proj.technologies.length > 4 && (
                          <span className="px-2 py-1 bg-primary/20 dark:bg-light/20 text-primary/70 dark:text-light/70 text-xs rounded-md">
                            +{proj.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Links */}
                  <div className="flex gap-3">
                    {proj.githubUrl && (
                      <a 
                        href={proj.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-light/70 dark:bg-primary/70 text-primary dark:text-light rounded-lg hover:bg-light/90 dark:hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        <FaGithub className="w-4 h-4" />
                        Code
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a 
                        href={proj.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors text-sm font-medium"
                      >
                        <FaExternalLinkAlt className="w-4 h-4" />
                        {proj.type === 'video' || proj.type === 'playlist' ? 'Voir' : 'Demo'}
                      </a>
                    )}
                    {(proj.type === 'video' || proj.type === 'playlist') && proj.url && (
                      <a 
                        href={proj.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                      >
                        <FaYoutube className="w-4 h-4" />
                        {proj.type === 'playlist' ? 'Playlist' : 'Vidéo'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gestion des Projets</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Gérez vos projets et réalisations
        </p>
        {!isFormVisible && (
          <button onClick={handleAddNew} className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            <FaPlus className="mr-2 inline" /> Ajouter un Projet
          </button>
        )}
      </div>

      {isFormVisible && (
        <ProjectForm 
          initialData={currentProject}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}

      {!isFormVisible && (
        <div>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-primary dark:text-light">Chargement des projets...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
          
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12 rounded-lg border border-primary/20 dark:border-light/20">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <FaProjectDiagram className="mx-auto h-12 w-12 mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun projet trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400">Commencez par ajouter votre premier projet.</p>
            </div>
          )}
          
          {!loading && !error && projects.length > 0 && (
            <div className="space-y-12">
              {/* Video Projects Section */}
              {renderProjectSection(
                'video',
                groupedProjects.video,
                'Projets Vidéo',
                FaVideo,
                'text-red-500',
                'bg-red-50 dark:bg-red-900/20'
              )}
              
              {/* Playlist Projects Section */}
              {renderProjectSection(
                'playlist',
                groupedProjects.playlist,
                'Playlists & Collections',
                FaPlay,
                'text-red-500',
                'bg-red-50 dark:bg-red-900/20'
              )}
              
              {/* Image Projects Section */}
              {renderProjectSection(
                'image',
                groupedProjects.image,
                'Projets Créatifs',
                FaImages,
                'text-accent',
                'bg-accent/10'
              )}
            </div>
          )}
        </div>
      )}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, project: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer le projet "${deleteModal.project?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ManageProjects;
