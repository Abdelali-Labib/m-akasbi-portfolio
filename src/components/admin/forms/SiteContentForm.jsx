"use client";

import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiPlus, FiUpload, FiFile, FiImage, FiEdit3 } from 'react-icons/fi';
import ErrorModal from '../ui/ErrorModal';

/**
 * Form component for editing site content documents
 */
const SiteContentForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    type: 'home',
    ...initialData
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const [editingPath, setEditingPath] = useState({ picture_name: false, cv_path: false });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event, fieldName) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress({ ...uploadProgress, [fieldName]: 0 });

    try {
      // Use API route for server-side upload with proper authentication
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fieldName', fieldName);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setErrorModal({
            isOpen: true,
            title: 'Fichier déjà existant',
            message: errorData.error,
            type: 'warning'
          });
          return;
        }
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: result.filename
      }));
      
      setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));
      
      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fieldName];
          return newProgress;
        });
      }, 2000);
      
    } catch (error) {
      
      setErrorModal({
        isOpen: true,
        title: 'Erreur de téléchargement',
        message: 'Une erreur est survenue lors du téléchargement du fichier. Veuillez réessayer.',
        type: 'error'
      });
      
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fieldName];
        return newProgress;
      });
    } finally {
      setUploading(false);
    }
  };

  const renderFormFields = () => {
    switch (formData.type || formData.id) {
      case 'home':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="w-full px-3 py-2 border border-primary/30 dark:border-light/30 rounded-lg text-primary dark:text-light focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-primary/30 dark:border-light/30 rounded-lg text-primary dark:text-light focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </>
        );

      case 'statistics':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statistiques (items)
            </label>
            {formData.items && Array.isArray(formData.items) ? (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border border-primary/30 dark:border-light/30 rounded-lg">
                    <input
                      type="number"
                      value={item.number || ''}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index] = {...item, number: parseInt(e.target.value) || 0};
                        setFormData({...formData, items: newItems});
                      }}
                          className="px-2 py-1 border border-primary/30 dark:border-light/30 rounded text-primary dark:text-light focus:border-accent focus:ring-1 focus:ring-accent/20"
                    />
                    <input
                      type="text"
                      value={item.text || ''}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index] = {...item, text: e.target.value};
                        setFormData({...formData, items: newItems});
                      }}
                          className="px-2 py-1 border border-primary/30 dark:border-light/30 rounded text-primary dark:text-light focus:border-accent focus:ring-1 focus:ring-accent/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = formData.items.filter((_, i) => i !== index);
                        setFormData({...formData, items: newItems});
                      }}
                          className="sm:col-span-2 px-2 py-1 text-red-500 rounded transition-colors"
                    >
                      <FiX className="w-4 h-4 inline mr-1" />
                      Supprimer
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newItems = [...(formData.items || []), {number: 0, text: ''}];
                    setFormData({...formData, items: newItems});
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Ajouter une statistique
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setFormData({...formData, items: [{number: 0, text: ''}]})}
                className="flex items-center gap-2 px-3 py-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Créer les statistiques
              </button>
            )}
          </div>
        );

      case 'socialMedia':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Liens des réseaux sociaux
            </label>
            <div className="space-y-3">
              {['facebook', 'instagram', 'linkedin', 'youtube'].map((platform) => (
                <div key={platform}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={formData.links?.[platform] || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      links: {
                        ...formData.links,
                        [platform]: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-primary/30 dark:border-light/30 rounded-lg bg-light/50 dark:bg-primary/50 text-primary dark:text-light focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile_picture':
        return (
          <div className="space-y-4">
            {formData.picture_name && (
              <div>
                <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                  Photo de profil actuelle
                </label>
                      <div className="mb-3 p-3 rounded-lg border border-primary/20 dark:border-light/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-primary/70 dark:text-light/70">Fichier actuel: </span>
                      <span className="font-medium text-primary dark:text-light">{formData.picture_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPath(prev => ({ ...prev, picture_name: !prev.picture_name }))}
                      className="p-1.5 text-primary/60 dark:text-light/60 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      title="Modifier le chemin manuellement"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {editingPath.picture_name && formData.picture_name && (
              <div>
                <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                  Modifier le chemin manuellement
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.picture_name || ''}
                    onChange={(e) => setFormData({...formData, picture_name: e.target.value})}
                          className="flex-1 px-3 py-2 border border-primary/30 dark:border-light/30 rounded-lg text-primary dark:text-light focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingPath(prev => ({ ...prev, picture_name: false }))}
                    className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                {formData.picture_name ? 'Changer la photo' : 'Télécharger une photo'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'picture_name')}
                  className="hidden"
                  id="picture-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="picture-upload"
                  className={`flex items-center justify-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-200 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiImage className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {uploading ? 'Téléchargement...' : 'Choisir une image (JPG, PNG, WebP)'}
                  </span>
                </label>
                {uploadProgress.picture_name && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress.picture_name}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress.picture_name}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'CV':
        return (
          <div className="space-y-4">
            {formData.cv_path && (
              <div>
                <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                  CV actuel
                </label>
                        <div className="mb-3 p-3 rounded-lg border border-primary/20 dark:border-light/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-primary/70 dark:text-light/70">Fichier actuel: </span>
                      <span className="font-medium text-primary dark:text-light">{formData.cv_path}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPath(prev => ({ ...prev, cv_path: !prev.cv_path }))}
                      className="p-1.5 text-primary/60 dark:text-light/60 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      title="Modifier le chemin manuellement"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {editingPath.cv_path && formData.cv_path && (
              <div>
                <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                  Modifier le chemin manuellement
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.cv_path || ''}
                    onChange={(e) => setFormData({...formData, cv_path: e.target.value})}
                            className="flex-1 px-3 py-2 border border-primary/30 dark:border-light/30 rounded-lg text-primary dark:text-light focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingPath(prev => ({ ...prev, cv_path: false }))}
                    className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                {formData.cv_path ? 'Changer le CV' : 'Télécharger un CV'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'cv_path')}
                  className="hidden"
                  id="cv-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="cv-upload"
                  className={`flex items-center justify-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-200 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiFile className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {uploading ? 'Téléchargement...' : 'Choisir un fichier PDF'}
                  </span>
                </label>
                {uploadProgress.cv_path && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress.cv_path}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress.cv_path}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              Formulaire générique pour {formData.type || formData.id}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {initialData ? 'Modifier le contenu' : 'Ajouter un contenu'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de contenu
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-primary/30 dark:border-light/30 rounded-lg text-primary dark:text-light focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="home">Contenu Accueil</option>
              <option value="statistics">Statistiques</option>
              <option value="socialMedia">Réseaux Sociaux</option>
              <option value="profile_picture">Photo de Profil</option>
              <option value="CV">CV</option>
            </select>
          </div>
        )}

        {renderFormFields()}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : (initialData ? 'Mettre à jour' : 'Créer')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-light dark:text-primary rounded-lg transition-colors flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Annuler
          </button>
        </div>
      </form>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '', type: 'error' })}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />
    </div>
  );
};

export default SiteContentForm;
