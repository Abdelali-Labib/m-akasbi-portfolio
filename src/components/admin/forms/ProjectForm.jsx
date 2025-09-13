"use client";

import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';
import ImageUpload from '../ui/ImageUpload';

const ProjectForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image',
    imageUrl: '',
    videoUrl: '',
    playlistUrl: '',
    thumbnailUrl: '',
    order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'image',
        imageUrl: initialData.img || '', // Map 'img' field from database
        videoUrl: initialData.type === 'video' ? initialData.url || '' : '',
        playlistUrl: initialData.type === 'playlist' ? initialData.url || '' : '',
        thumbnailUrl: initialData.thumbnail || '',
        order: initialData.order || 0,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'image',
        imageUrl: '',
        videoUrl: '',
        playlistUrl: '',
        thumbnailUrl: '',
        order: 0,
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'order' ? parseInt(value, 10) : value;
    setFormData({ ...formData, [name]: finalValue });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, imageUrl: 'Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.' });
      return;
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors({ ...errors, imageUrl: 'L\'image est trop volumineuse. Taille maximale: 5MB.' });
      return;
    }
    
    setUploading(true);
    setErrors({ ...errors, imageUrl: '' });
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      
      if (!response.ok) {
        throw new Error('Échec du téléchargement');
      }
      
      const result = await response.json();
      setFormData({ ...formData, imageUrl: result.url });
    } catch (error) {
      setErrors({ ...errors, imageUrl: 'Erreur lors du téléchargement. Veuillez réessayer.' });
    } finally {
      setUploading(false);
    }
  };

  const handleTechInputChange = (e) => {
    setTechInput(e.target.value);
  };


  const validateForm = () => {
    const newErrors = {};
    
    // Validate required image for image type projects
    if (formData.type === 'image' && !formData.imageUrl) {
      newErrors.imageUrl = 'Une image est requise pour ce type de projet.';
    }
    
    // Validate required video URL for video type projects
    if (formData.type === 'video' && !formData.videoUrl) {
      newErrors.videoUrl = 'L\'URL de la vidéo est requise.';
    }
    
    // Validate required playlist URL for playlist type projects
    if (formData.type === 'playlist' && !formData.playlistUrl) {
      newErrors.playlistUrl = 'L\'URL de la playlist est requise.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      
      // Prepare data based on project type to match database structure
      let projectData = {
        type: formData.type,
        order: formData.order || 0
      };

      // Add type-specific fields with correct field names
      if (formData.type === 'image') {
        projectData.img = formData.imageUrl;
        projectData.description = formData.description;
      } 
      if (formData.type === 'video') {
        projectData.thumbnail = initialData ? formData.thumbnailUrl : getAutoThumbnailUrl();
        projectData.title = formData.title;
        projectData.url = formData.videoUrl;
      } else if (formData.type === 'playlist') {
        projectData.thumbnail = formData.thumbnailUrl;
        projectData.title = formData.title;
        projectData.url = formData.playlistUrl;
      }
      
      await onSubmit(projectData);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to extract YouTube video ID from URL
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Helper function to extract YouTube playlist ID from URL
  const extractYouTubePlaylistId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]list=([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Generate YouTube video thumbnail URL
  const extractYouTubeVideoThumbnail = (url) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp` : '';
  };

  // Generate YouTube playlist thumbnail URL (uses first video in playlist)
  const extractYouTubePlaylistThumbnail = (url) => {
    const playlistId = extractYouTubePlaylistId(url);
    // For playlists, we'll use a generic approach or the user can manually set thumbnail
    return playlistId ? '' : '';
  };

  // Get auto-generated thumbnail URL based on video/playlist URL
  const getAutoThumbnailUrl = () => {
    if (formData.type === 'video' && formData.videoUrl) {
      return extractYouTubeVideoThumbnail(formData.videoUrl);
    }
    if (formData.type === 'playlist' && formData.playlistUrl) {
      return extractYouTubePlaylistThumbnail(formData.playlistUrl);
    }
    return '';
  };

  return (
    <div className="border border-primary/20 dark:border-light/20 rounded-lg p-6 mb-8 bg-white dark:bg-primary">
      <h2 className="text-xl font-semibold mb-6 text-primary dark:text-light">{initialData ? 'Modifier Projet' : 'Ajouter Projet'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector - First Field */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Type de Projet</label>
            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required>
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="playlist">Playlist</option>
            </select>
          </div>

          {/* Image Type Fields */}
          {formData.type === 'image' && (
            <>
              <div>
                <ImageUpload
                  currentImage={formData.imageUrl}
                  onImageChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  onFileUpload={handleImageUpload}
                  label="Image du Projet"
                  uploading={uploading}
                  error={errors.imageUrl}
                />
                {errors.imageUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" rows="3" required />
              </div>
            </>
          )}

          {/* Video Type Fields */}
          {formData.type === 'video' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary dark:text-light">URL Vidéo YouTube</label>
                <input 
                  name="videoUrl" 
                  value={formData.videoUrl} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Titre</label>
                <input name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary dark:text-light">
                  URL Thumbnail {!initialData ? '(Auto-généré)' : ''}
                </label>
                <input 
                  name="thumbnailUrl" 
                  value={initialData ? formData.thumbnailUrl : getAutoThumbnailUrl()} 
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 text-primary dark:text-light ${
                    initialData ? 'bg-white dark:bg-primary' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  disabled={!initialData}
                />
                {(initialData ? formData.thumbnailUrl : getAutoThumbnailUrl()) && (
                  <div className="mt-2">
                    <img 
                      src={initialData ? formData.thumbnailUrl : getAutoThumbnailUrl()} 
                      alt="Aperçu thumbnail" 
                      className="w-32 h-18 object-cover rounded border"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Playlist Type Fields */}
          {formData.type === 'playlist' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary dark:text-light">URL Thumbnail</label>
                <input 
                  name="thumbnailUrl" 
                  value={formData.thumbnailUrl} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 text-primary dark:text-light" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Titre</label>
                <input name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 text-primary dark:text-light" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary dark:text-light">URL Playlist YouTube</label>
                <input 
                  name="playlistUrl" 
                  value={extractYouTubePlaylistThumbnail(formData.playlistUrl)} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 text-primary dark:text-light" 
                  required 
                />
              </div>
            </>
          )}


          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button 
              type="submit" 
              disabled={saving || uploading}
              className="w-full sm:w-auto px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : (initialData ? 'Mettre à Jour' : 'Sauvegarder')}
            </button>
            <button type="button" onClick={onCancel} className="w-full sm:w-auto px-6 py-3 text-light dark:text-primary rounded-lg transition-colors flex items-center gap-2">
              <FiX className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </form>
    </div>
  );
};

export default ProjectForm;
