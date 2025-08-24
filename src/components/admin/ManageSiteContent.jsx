"use client";

import React, { useState, useEffect } from 'react';
import { 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiHome,
  FiBarChart,
  FiShare2,
  FiUser,
  FiFileText,
  FiRefreshCw,
  FiPlus
} from 'react-icons/fi';
import DataRenderer from './DataRenderer';
import FormGenerator from './FormGenerator';
import LoadingSpinner from './LoadingSpinner';

/**
 * ManageSiteContent - Admin component for managing siteContent collection
 * Handles documents like home, statistics, socialMedia, profile, and CV
 */
const ManageSiteContent = () => {
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Document configurations with icons and descriptions
  const documentConfigs = {
    home: {
      icon: FiHome,
      title: 'Contenu Accueil',
      description: 'Textes et contenus de la page d\'accueil',
      color: 'bg-blue-500'
    },
    statistics: {
      icon: FiBarChart,
      title: 'Statistiques',
      description: 'Données statistiques affichées sur l\'accueil',
      color: 'bg-green-500'
    },
    socialMedia: {
      icon: FiShare2,
      title: 'Réseaux Sociaux',
      description: 'Liens vers les réseaux sociaux',
      color: 'bg-purple-500'
    },
    profile: {
      icon: FiUser,
      title: 'Profil',
      description: 'Informations de profil et photo',
      color: 'bg-orange-500'
    },
    CV: {
      icon: FiFileText,
      title: 'CV',
      description: 'Chemin vers le fichier CV',
      color: 'bg-red-500'
    }
  };

  /**
   * Fetches all siteContent documents from the API
   */
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sitecontent');
      const data = await response.json();
      
      if (response.ok) {
        setDocuments(data.documents || {});
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves a document to the siteContent collection
   */
  const saveDocument = async (docId, data) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/sitecontent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docId, data }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setDocuments(prev => ({
          ...prev,
          [docId]: data
        }));
        setSuccess('Document sauvegardé avec succès');
        setEditingDoc(null);
        setEditData({});
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Starts editing a document
   */
  const startEditing = (docId) => {
    setEditingDoc(docId);
    setEditData(documents[docId] || {});
    setError('');
    setSuccess('');
  };

  /**
   * Cancels editing
   */
  const cancelEditing = () => {
    setEditingDoc(null);
    setEditData({});
    setError('');
    setSuccess('');
  };

  /**
   * Handles saving the edited document
   */
  const handleSave = () => {
    if (editingDoc) {
      saveDocument(editingDoc, editData);
    }
  };

  /**
   * Renders the editor for different document types
   */
  const renderEditor = (docId, data) => {
    switch (docId) {
      case 'home':
        // Custom editor for 'home' document
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                value={data.subtitle || ''}
                onChange={(e) => setEditData({...data, subtitle: e.target.value})}
                className="w-full px-3 py-2 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light"
                placeholder="Sous-titre de la page d'accueil"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                Descriptions (une par ligne)
              </label>
              <textarea
                value={Array.isArray(data.descriptions) ? data.descriptions.join('\n') : ''}
                onChange={(e) => setEditData({...data, descriptions: e.target.value.split('\n').filter(line => line.trim())})}
                rows={4}
                className="w-full px-3 py-2 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light"
                placeholder="Descriptions séparées par des retours à la ligne"
              />
            </div>
          </div>
        );

      case 'CV':
        // Custom editor for 'CV' document
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary dark:text-light mb-2">
                Chemin vers le CV
              </label>
              <input
                type="text"
                value={data.cv_path || ''}
                onChange={(e) => setEditData({...data, cv_path: e.target.value})}
                className="w-full px-3 py-2 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light"
                placeholder="chemin/vers/cv.pdf"
              />
            </div>
          </div>
        );

      // Use FormGenerator for all other documents
      default:
        return <FormGenerator data={data} setData={setEditData} />;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return <LoadingSpinner message="Chargement du contenu du site..." size="lg" variant="dots" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50/50 dark:from-primary/50 dark:to-primary/30 p-6 rounded-2xl border border-primary/10 dark:border-light/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent dark:from-light dark:to-accent">
              Contenu du Site
            </h2>
            <p className="text-primary/70 dark:text-light/70 mt-2 text-lg">
              Gérez les contenus statiques de votre portfolio avec une interface moderne
            </p>
          </div>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-white rounded-xl hover:from-accent/90 hover:to-accent/70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-medium">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {Object.entries(documentConfigs).map(([docId, config]) => {
          const IconComponent = config.icon;
          const docData = documents[docId];
          const isEditing = editingDoc === docId;

          return (
            <div key={docId} className={`group relative bg-white dark:bg-primary/50 rounded-2xl border border-primary/10 dark:border-light/10 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${
              isEditing ? 'ring-2 ring-accent/50 shadow-accent/20' : ''
            }`}>
              {/* Card Header */}
              <div className={`p-6 border-b border-primary/10 dark:border-light/10 bg-gradient-to-r ${config.color}/5 dark:${config.color}/10`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary dark:text-light">
                        {config.title}
                      </h3>
                      <p className="text-sm text-primary/70 dark:text-light/70 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => startEditing(docId)}
                        className="p-3 text-primary/60 dark:text-light/60 hover:text-accent hover:bg-accent/10 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Modifier ce contenu"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="p-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:scale-100"
                          title="Sauvegarder les modifications"
                        >
                          <FiSave className={`w-5 h-5 ${saving ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Annuler les modifications"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    {renderEditor(docId, editData)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {docData ? (
                      <div className="bg-gradient-to-br from-gray-50/50 to-transparent dark:from-primary/20 dark:to-transparent rounded-xl p-4 border border-primary/5 dark:border-light/5">
                        <DataRenderer data={docData} />
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary/10 dark:bg-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="w-8 h-8 text-primary/40 dark:text-light/40" />
                        </div>
                        <p className="text-primary/60 dark:text-light/60 mb-4">Aucune donnée trouvée</p>
                        <button
                          onClick={() => startEditing(docId)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                        >
                          <FiPlus className="w-4 h-4" />
                          Créer ce document
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageSiteContent;
