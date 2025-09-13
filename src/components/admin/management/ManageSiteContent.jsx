"use client";

import React, { useState, useEffect } from 'react';
import { 
  FiEdit, 
  FiTrash2, 
  FiHome,
  FiTrendingUp,
  FiInstagram,
  FiUser,
  FiFileText,
  FiAlertTriangle,
  FiSettings,
  FiEye
} from 'react-icons/fi';
import { 
  HiSparkles,
  HiPhotograph,
  HiDocumentText
} from 'react-icons/hi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmationModal from '../ui/ConfirmationModal';
import SiteContentForm from '../forms/SiteContentForm';

/**
 * Main component for managing site content documents.
 * Handles fetching, creating, updating, and deleting site content.
 */
const ManageSiteContent = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, document: null, loading: false });

  // Document configurations with icons and descriptions
  const documentConfigs = {
    home: {
      icon: HiSparkles,
      title: 'Contenu Accueil',
      description: 'Description et sous-titre de la page d\'accueil'
    },
    statistics: {
      icon: FiTrendingUp,
      title: 'Statistiques',
      description: 'Données statistiques avec items array'
    },
    socialMedia: {
      icon: FiInstagram,
      title: 'Réseaux Sociaux',
      description: 'Liens vers les réseaux sociaux'
    },
    profile_picture: {
      icon: HiPhotograph,
      title: 'Photo de Profil',
      description: 'Nom du fichier de la photo de profil'
    },
    CV: {
      icon: HiDocumentText,
      title: 'CV',
      description: 'Chemin vers le fichier CV'
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/admin/sitecontent');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const result = await response.json();
      const data = result.documents || result;
      
      // Convert documents object to array format for consistency
      const documentsArray = Object.entries(data).map(([id, docData]) => ({
        id,
        ...docData,
        type: id // Use document ID as type
      }));
      
      setDocuments(documentsArray);
    } catch (error) {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (currentDocument) {
        const response = await fetch('/api/admin/sitecontent', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docId: currentDocument.id, data: formData })
        });
        if (!response.ok) throw new Error('Failed to update document');
      } else {
        const response = await fetch('/api/admin/sitecontent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to create document');
      }
      
      await fetchDocuments();
      resetForm();
    } catch (error) {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };


  const handleEdit = (doc) => {
    setCurrentDocument(doc);
    setIsFormVisible(true);
  };

  const handleDeleteClick = (document) => {
    setDeleteModal({ isOpen: true, document, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.document) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch('/api/admin/sitecontent', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: deleteModal.document.id })
      });
      if (!response.ok) throw new Error('Failed to delete document');
      await fetchDocuments();
      setDeleteModal({ isOpen: false, document: null, loading: false });
    } catch (error) {
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setCurrentDocument(null);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Chargement du contenu du site..." size="lg" variant="dots" />;
  }

  /**
   * Renders a list of documents with edit and delete controls.
   */
  const DocumentList = ({ title, documents, icon: Icon }) => (
    <div className="mb-12">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary dark:text-light mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documents.map(doc => {
          const config = documentConfigs[doc.id] || { icon: FiFileText, title: doc.id, description: 'Document' };
          const IconComponent = config.icon;
          
          return (
            <div key={doc.id} className="group backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-primary/10 dark:border-light/10 hover:border-primary/20 dark:hover:border-light/20 transition-all duration-300 hover:shadow-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-light mb-3">
                    {config.title}
                  </h3>
                  <div className="space-y-2 text-primary/60 dark:text-light/60">
                    <div className="text-xs sm:text-sm font-medium text-primary/80 dark:text-light/80 mb-2">{config.description}</div>
                    {doc.subtitle && <div className="text-xs sm:text-sm"><strong>Sous-titre:</strong> <span className="break-words">{doc.subtitle}</span></div>}
                    {doc.description && <div className="text-xs sm:text-sm"><strong>Contenu:</strong> <span className="break-words">{doc.description.substring(0, 80)}...</span></div>}
                    {doc.items && <div className="text-xs sm:text-sm"><strong>Statistiques:</strong> {doc.items.length} éléments</div>}
                    {doc.links && <div className="text-xs sm:text-sm"><strong>Réseaux:</strong> <span className="break-words">{Object.keys(doc.links).join(', ')}</span></div>}
                    {doc.picture_name && <div className="text-xs sm:text-sm"><strong>Photo:</strong> <span className="break-words">{doc.picture_name}</span></div>}
                    {doc.cv_path && <div className="text-xs sm:text-sm"><strong>CV:</strong> <span className="break-words">{doc.cv_path}</span></div>}
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 justify-end sm:justify-start">
                  <button 
                    onClick={() => handleEdit(doc)} 
                    className="p-2 text-accent rounded-lg transition-colors shadow-sm"
                    title="Modifier"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(doc)}
                    className="p-2 text-red-500 rounded-lg transition-colors shadow-sm"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
  <div className="min-h-screen bg-gradient-to-br p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary dark:text-light mb-2">Gestion du Contenu du Site</h1>
        <p className="text-primary/60 dark:text-light/60 text-sm sm:text-base lg:text-lg mb-6">
          Gérez les contenus statiques de votre portfolio
        </p>
      </div>

      {isFormVisible && (
        <SiteContentForm 
          initialData={currentDocument}
          onSubmit={handleFormSubmit}
          onCancel={resetForm}
        />
      )}

      {!isFormVisible && documents.length === 0 && (
  <div className="backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-primary/10 dark:border-light/10 text-center">
          <FiAlertTriangle className="w-12 h-12 text-primary/40 dark:text-light/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary dark:text-light">Aucun Contenu Trouvé</h3>
          <p className="text-primary/60 dark:text-light/60 mt-2">Les contenus du site n'ont pas encore été configurés.</p>
        </div>
      )}

      {!isFormVisible && (
        <div>
          <DocumentList title="" documents={documents} icon={FiFileText} /> 
        </div>
      )}
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, document: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le contenu"
        message={`Êtes-vous sûr de vouloir supprimer le contenu "${deleteModal.document?.id}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
      </div>
    </div>
  );
};

export default ManageSiteContent;
