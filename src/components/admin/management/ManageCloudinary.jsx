"use client";

import { FaExclamationTriangle, FaFilePdf } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { 
  FiUpload, 
  FiTrash2, 
  FiCopy, 
  FiEye, 
  FiDownload, 
  FiSearch, 
  FiFilter, 
  FiImage, 
  FiVideo, 
  FiFile, 
  FiRefreshCw,
  FiMusic,
  FiCloud,
  FiEdit3,
} from 'react-icons/fi';
import LoadingSpinner from '../ui/LoadingSpinner';

import ConfirmationModal from '../ui/ConfirmationModal';

/**
 * ManageCloudinary - Admin component for managing Cloudinary files
 * Allows viewing, uploading, and deleting files from Cloudinary
 */
const ManageCloudinary = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [message, setMessage] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, files: [], loading: false });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renameModal, setRenameModal] = useState({ isOpen: false, file: null, newName: '', loading: false, error: '' });

  /**
   * Gets the appropriate icon for a file type
   */
  const getFileIcon = (resourceType, format) => {
    if (format === 'pdf') return FaFilePdf;
    if (resourceType === 'image') return FiImage;
    if (resourceType === 'video') return FiVideo;
    if (resourceType === 'audio') return FiMusic;
    return FiFile;
  };

  /**
   * Gets the file type category for filtering
   */
  const getFileType = (resourceType, format) => {
    if (resourceType === 'image') return 'image';
    if (resourceType === 'video') return 'video';
    if (resourceType === 'audio') return 'audio';
    return 'document';
  };

  /**
   * Formats file size in human readable format
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Fetches all files from Cloudinary
   */
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cloudinary');
      const data = await response.json();
      
      if (response.ok) {
        setFiles(data.files || []);
      } else {
        setMessage(data.error || 'Erreur lors du chargement des fichiers');
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles file upload to Cloudinary
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('Fichier uploadé avec succès');
        fetchFiles(); // Refresh the file list
      } else {
        setMessage(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleFileSelect = (publicId) => {
    setSelectedFiles(prev => 
      prev.includes(publicId) 
        ? prev.filter(id => id !== publicId)
        : [...prev, publicId]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedFiles(filteredFiles.map(f => f.public_id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDeleteClick = (file) => {
    setDeleteModal({ isOpen: true, files: [file], loading: false });
  };

  const handleBulkDeleteClick = () => {
    const filesToDelete = files.filter(f => selectedFiles.includes(f.public_id));
    setDeleteModal({ isOpen: true, files: filesToDelete, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.files || deleteModal.files.length === 0) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    const resourcesToDelete = deleteModal.files.map(f => ({ 
      public_id: f.public_id,
      resource_type: f.resource_type
    }));

    try {
      const response = await fetch('/api/admin/cloudinary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resources: resourcesToDelete }),
      });
      
      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || `${resourcesToDelete.length} fichier(s) supprimé(s) avec succès`);
        setSelectedFiles([]);
        await fetchFiles();
        setDeleteModal({ isOpen: false, files: [], loading: false });
      } else {
        setMessage(result.error || 'Erreur lors de la suppression');
        setDeleteModal(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setMessage('Erreur lors de la suppression');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRenameClick = (file) => {
    setRenameModal({ 
      isOpen: true, 
      file, 
      newName: file.original_filename || file.public_id, 
      loading: false, 
      error: '' 
    });
  };

  const handleRenameConfirm = async () => {
    if (!renameModal.file || !renameModal.newName.trim()) return;
    
    setRenameModal(prev => ({ ...prev, loading: true, error: '' }));
    
    try {
      // Check if name already exists
      const nameExists = files.some(f => 
        f.public_id !== renameModal.file.public_id && 
        (f.original_filename === renameModal.newName.trim() || f.public_id === renameModal.newName.trim())
      );
      
      if (nameExists) {
        setRenameModal(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Un fichier avec ce nom existe déjà' 
        }));
        return;
      }

      const response = await fetch('/api/admin/cloudinary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          public_id: renameModal.file.public_id,
          resource_type: renameModal.file.resource_type,
          new_name: renameModal.newName.trim()
        }),
      });
      
      const result = await response.json();

      if (response.ok) {
        setMessage('Fichier renommé avec succès');
        await fetchFiles();
        setRenameModal({ isOpen: false, file: null, newName: '', loading: false, error: '' });
      } else {
        setRenameModal(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Erreur lors du renommage' 
        }));
      }
    } catch (error) {
      setRenameModal(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Erreur lors du renommage' 
      }));
    }
  };

  /**
   * Copies URL to clipboard
   */
  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('URL copiée dans le presse-papiers');
    } catch (error) {
      setMessage('Erreur lors de la copie');
    }
  };

  /**
   * Filters files based on search term and type
   */
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.public_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.original_filename && file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || getFileType(file.resource_type, file.format) === filterType;
    
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-light mb-2">Gestionnaire de Fichiers</h1>
        <p className="text-primary/70 dark:text-light/70 text-lg mb-6">
          Gérez vos fichiers Cloudinary - images, vidéos, documents
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="px-6 py-3 bg-primary/10 dark:bg-light/10 text-primary dark:text-light rounded-lg hover:bg-primary/20 dark:hover:bg-light/20 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <label className={`px-6 py-3 rounded-lg transition-colors cursor-pointer ${
            uploading 
              ? 'bg-accent/50 text-white cursor-not-allowed' 
              : 'bg-accent text-white hover:bg-accent/90'
          }`}>
            <FiUpload className="w-5 h-5 mr-2 inline" />
            {uploading ? 'Upload en cours...' : 'Uploader un fichier'}
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
          </label>

          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDeleteClick}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="w-5 h-5 mr-2 inline" />
              Supprimer ({selectedFiles.length})
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('succès') || message.includes('copiée') 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center">
            {message.includes('succès') || message.includes('copiée') ? (
              <FiEye className="mr-2" />
            ) : (
              <FaExclamationTriangle className="mr-2" />
            )}
            {message}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-primary dark:text-light mb-4">Recherche et Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary/70 dark:text-light/70 mb-2">Rechercher</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/50 dark:text-light/50" />
              <input
                type="text"
                placeholder="Rechercher des fichiers par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/70 dark:text-light/70 mb-2">Type de fichier</label>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/50 dark:text-light/50" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-accent transition-colors appearance-none"
              >
                <option value="all">Tous les types</option>
                <option value="image">Images</option>
                <option value="video">Vidéos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-primary dark:text-light mb-4">Statistiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-primary border border-primary/20 dark:border-light/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1">{files.length}</div>
            <div className="text-sm text-primary/70 dark:text-light/70">Total fichiers</div>
          </div>
          <div className="bg-white dark:bg-primary border border-primary/20 dark:border-light/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">{files.filter(f => f.resource_type === 'image').length}</div>
            <div className="text-sm text-primary/70 dark:text-light/70">Images</div>
          </div>
          <div className="bg-white dark:bg-primary border border-primary/20 dark:border-light/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-500 mb-1">{files.filter(f => f.resource_type === 'video').length}</div>
            <div className="text-sm text-primary/70 dark:text-light/70">Vidéos</div>
          </div>
          <div className="bg-white dark:bg-primary border border-primary/20 dark:border-light/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">{formatFileSize(files.reduce((total, file) => total + (file.bytes || 0), 0))}</div>
            <div className="text-sm text-primary/70 dark:text-light/70">Taille totale</div>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Fichiers ({filteredFiles.length})</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="selectAll"
              onChange={handleSelectAll}
              checked={filteredFiles.length > 0 && selectedFiles.length === filteredFiles.length}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <label htmlFor="selectAll" className="ml-2 text-sm text-gray-600 dark:text-gray-300">Tout sélectionner</label>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner message="Chargement des fichiers..." size="lg" variant="dots" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 bg-light/50 dark:bg-primary/50 rounded-lg border border-primary/20 dark:border-light/20">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <FiCloud className="mx-auto h-12 w-12 mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || filterType !== 'all' ? 'Aucun fichier trouvé' : 'Aucun fichier uploadé'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par uploader votre premier fichier.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFiles.map((file) => {
              const IconComponent = getFileIcon(file.resource_type, file.format);

              return (
                <div key={file.public_id} className={`group border rounded-xl overflow-hidden bg-white dark:bg-primary shadow-sm hover:shadow-lg transition-all duration-300 ${selectedFiles.includes(file.public_id) ? 'border-accent shadow-accent/20' : 'border-primary/20 dark:border-light/20 hover:border-accent/50'}`}>
                  {/* Preview */}
                  <div className="relative h-48 bg-gradient-to-br from-light/70 to-light/90 dark:from-primary/70 dark:to-primary/90">
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.public_id)}
                        onChange={() => handleFileSelect(file.public_id)}
                        className="h-5 w-5 rounded border-primary/30 text-accent focus:ring-accent bg-light/50 dark:bg-primary/50 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()} // Prevent card click event
                      />
                    </div>

                    {file.resource_type === 'image' && file.format !== 'pdf' ? (
                      <img
                        src={file.secure_url}
                        alt={file.original_filename || file.public_id}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconComponent className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    
                    {/* File Type Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-light/90 dark:bg-primary/90 text-primary dark:text-light backdrop-blur-sm group-hover:opacity-0 transition-opacity duration-300">
                      {file.format?.toUpperCase()}
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => copyToClipboard(file.secure_url)}
                        className="p-2 bg-light/90 dark:bg-primary/90 text-blue-500 rounded-lg hover:bg-light dark:hover:bg-primary transition-colors shadow-sm"
                        title="Copier URL"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRenameClick(file)}
                        className="p-2 bg-light/90 dark:bg-primary/90 text-yellow-500 rounded-lg hover:bg-light dark:hover:bg-primary transition-colors shadow-sm"
                        title="Renommer"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <a
                        href={file.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-light/90 dark:bg-primary/90 text-accent rounded-lg hover:bg-light dark:hover:bg-primary transition-colors shadow-sm"
                        title="Voir le fichier"
                      >
                        <FiEye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteClick(file)}
                        className="p-2 bg-light/90 dark:bg-primary/90 text-red-500 rounded-lg hover:bg-light dark:hover:bg-primary transition-colors shadow-sm"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-primary dark:text-light mb-2 truncate" title={file.original_filename || file.public_id}>
                      {file.original_filename || file.public_id}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-primary/70 dark:text-light/70">
                      <div className="flex justify-between">
                        <span>Taille:</span>
                        <span className="font-medium">{formatFileSize(file.bytes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{file.format === 'pdf' ? 'PDF' : file.resource_type}</span>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4">
                      <a
                        href={file.secure_url}
                        download
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-light/70 dark:bg-primary/70 text-primary dark:text-light rounded-lg hover:bg-light/90 dark:hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        <FiDownload className="w-4 h-4" />
                        Télécharger
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, file: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le fichier"
        message={
          deleteModal.files.length > 1
            ? `Êtes-vous sûr de vouloir supprimer ${deleteModal.files.length} fichiers ? Cette action est irréversible.`
            : `Êtes-vous sûr de vouloir supprimer le fichier "${deleteModal.files[0]?.public_id}" ? Cette action est irréversible.`
        }
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />

      {/* Rename Modal */}
      {renameModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-primary rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary dark:text-light mb-4">
                Renommer le fichier
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-primary/70 dark:text-light/70 mb-2">
                  Nouveau nom
                </label>
                <input
                  type="text"
                  value={renameModal.newName}
                  onChange={(e) => setRenameModal(prev => ({ ...prev, newName: e.target.value, error: '' }))}
                  className="w-full px-3 py-2 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="Entrez le nouveau nom"
                  disabled={renameModal.loading}
                />
              </div>

              {renameModal.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">{renameModal.error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRenameModal({ isOpen: false, file: null, newName: '', loading: false, error: '' })}
                  disabled={renameModal.loading}
                  className="px-4 py-2 text-primary/70 dark:text-light/70 hover:text-primary dark:hover:text-light transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRenameConfirm}
                  disabled={renameModal.loading || !renameModal.newName.trim()}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {renameModal.loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {renameModal.loading ? 'Renommage...' : 'Renommer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCloudinary;
