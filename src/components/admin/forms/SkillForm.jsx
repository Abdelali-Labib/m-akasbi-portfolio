"use client";

import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiUpload, FiImage, FiEdit3 } from 'react-icons/fi';
import ErrorModal from '../ui/ErrorModal';

const SkillForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    percentage: 50,
    category: 'technical',
    icon: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const [editingPath, setEditingPath] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        percentage: initialData.percentage || initialData.level || 50,
        category: initialData.category || 'technical',
        icon: initialData.icon || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'percentage' ? parseInt(value, 10) : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress({ icon: 0 });

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fieldName', 'icon');
      
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
        icon: result.filename
      }));

      setUploadProgress({ icon: 100 });
      
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress.icon;
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
        delete newProgress.icon;
        return newProgress;
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
  <div className="border border-primary/20 dark:border-light/20 rounded-xl p-4 sm:p-6 mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-primary dark:text-light">{initialData ? 'Modifier Compétence' : 'Ajouter Compétence'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Nom de la Compétence</label>
            <input name="name" value={formData.name} onChange={handleInputChange} className="admin-input" required />
          </div>
          <div className="space-y-4">
            {formData.icon && (
              <div>
                <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                  Icône actuelle
                </label>
                <div className="mb-3 p-3 rounded-lg border border-primary/20 dark:border-light/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm text-primary/70 dark:text-light/70">Fichier actuel: </span>
                      <span className="font-medium text-primary dark:text-light">{formData.icon}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPath(!editingPath)}
                      className="p-1.5 text-primary/60 dark:text-light/60 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      title="Modifier le chemin manuellement"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Image Preview */}
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16 rounded-lg border border-primary/20 dark:border-light/20 overflow-hidden">
                      <img
                        src={formData.icon.startsWith('http') ? formData.icon : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${formData.icon}`}
                        alt="Aperçu de l'icône"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                        <FiImage className="w-6 h-6 text-primary/40 dark:text-light/40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {editingPath && formData.icon && (
              <div>
                <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                  Modifier le chemin manuellement
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="flex-1 admin-input"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingPath(false)}
                    className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                {formData.icon ? 'Changer l\'icône' : 'Télécharger une icône'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="icon-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="icon-upload"
                  className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-primary/30 dark:border-light/30 rounded-lg cursor-pointer hover:border-accent/50 transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiUpload className="w-5 h-5 text-primary/60 dark:text-light/60" />
                  <span className="text-sm text-primary/70 dark:text-light/70">
                    {uploading ? 'Téléchargement...' : 'Cliquez pour télécharger une icône'}
                  </span>
                </label>
                {uploadProgress.icon !== undefined && (
                  <div className="mt-2">
                    <div className="w-full rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress.icon}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2 text-primary dark:text-light">Catégorie</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className="admin-input" required>
              <option value="technical">Outils Techniques</option>
              <option value="comprehensive">Compétences Générales</option>
              <option value="language">Langues</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-xs sm:text-sm font-medium text-primary dark:text-light">Niveau: <span className="text-accent font-semibold">{formData.percentage}%</span></label>
            <input type="range" name="percentage" min="0" max="100" value={formData.percentage} onChange={handleInputChange} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-accent" />
          </div>

          <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button 
              type="submit" 
              disabled={saving || uploading}
              className="w-full sm:w-auto px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : (initialData ? 'Mettre à Jour' : 'Sauvegarder')}
            </button>
            <button type="button" onClick={onCancel} className="admin-cancel-button">
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

export default SkillForm;
