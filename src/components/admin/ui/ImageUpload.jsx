"use client";

import React, { useState } from 'react';
import { FiUpload, FiImage, FiX, FiCheck } from 'react-icons/fi';
import { getCloudinaryUrl } from '@/Data/config';

/**
 * Reusable image upload component with Cloudinary integration
 * @param {Object} props
 * @param {string} props.value - Current image name/path
 * @param {Function} props.onChange - Callback when image changes
 * @param {string} props.label - Label for the upload field
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 */
const ImageUpload = ({ value, onChange, label, placeholder = "Nom de l'image", required = false }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // Get file name without extension for Cloudinary public_id
      const fileName = file.name.split('.')[0];
      
      // Check if image with this name already exists
      const checkResponse = await fetch(`/api/admin/cloudinary/check?name=${fileName}`);
      const checkResult = await checkResponse.json();
      
      if (checkResult.exists) {
        const shouldReplace = confirm(`Une image avec le nom "${fileName}" existe déjà. Voulez-vous la remplacer ?`);
        if (!shouldReplace) {
          setUploading(false);
          return;
        }
      }

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('public_id', fileName); // Use filename as public_id
      formData.append('overwrite', 'true'); // Allow overwriting existing files

      const uploadResponse = await fetch('/api/admin/cloudinary/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Échec du téléchargement');
      }

      const uploadResult = await uploadResponse.json();
      
      if (uploadResult.success) {
        // Save just the filename (public_id) to database
        onChange(fileName);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(uploadResult.error || 'Erreur lors du téléchargement');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleTextChange = (e) => {
    onChange(e.target.value);
    setError('');
    setSuccess(false);
  };

  const clearValue = () => {
    onChange('');
    setError('');
    setSuccess(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs sm:text-sm font-medium text-primary dark:text-light">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Text input for manual entry */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 rounded-lg border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light text-sm sm:text-base"
          required={required}
        />
        {value && (
          <button
            type="button"
            onClick={clearValue}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary/40 hover:text-primary dark:text-light/40 dark:hover:text-light"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* File upload */}
      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-primary/20 dark:border-light/20 rounded-lg hover:border-accent/50 transition-colors bg-light/20 dark:bg-primary/20">
            {uploading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
                <span className="text-sm text-primary/70 dark:text-light/70">Téléchargement...</span>
              </>
            ) : (
              <>
                <FiUpload className="w-4 h-4 text-accent" />
                <span className="text-sm text-primary dark:text-light">Télécharger une image</span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        
        {success && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <FiCheck className="w-4 h-4" />
            <span className="text-sm">Téléchargé</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Preview */}
      {value && !uploading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-primary/70 dark:text-light/70">
            <FiImage className="w-4 h-4" />
            <span>Image: {value}</span>
          </div>
          <div className="relative inline-block">
            <img 
              src={getCloudinaryUrl(value)} 
              alt={`Preview: ${value}`}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-primary/20 dark:border-light/20 shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 dark:bg-light/10 rounded-lg border border-primary/20 dark:border-light/20 items-center justify-center">
              <FiImage className="w-6 h-6 text-primary/40 dark:text-light/40" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
