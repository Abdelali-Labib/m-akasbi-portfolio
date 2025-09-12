"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { FiMail, FiTrash2, FiEye, FiEyeOff, FiInbox, FiCheckSquare, FiAlertCircle, FiRefreshCw, FiX, FiClock, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmationModal from '../ui/ConfirmationModal';

/**
 * Simple StatCard component matching existing admin style.
 * @param {{ title: string, value: string | number, icon: React.ElementType, rate?: boolean }} props
 */
const StatCard = ({ title, value, icon: Icon, rate = false }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${
          rate ? (value > 75 ? 'text-green-600' : value > 25 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-900 dark:text-gray-100'
        }`}>
          {value}{rate && '%'}
        </p>
      </div>
      <div className="p-3 bg-accent/10 rounded-lg">
        <Icon className="w-6 h-6 text-accent" />
      </div>
    </div>
  </div>
);

/**
 * Enhanced ManageMessages component with improved error handling and user experience.
 * Provides comprehensive message management with proper Firestore integration.
 */
const ManageMessages = () => {
  // Core state management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, message: null, loading: false });
  
  // UI state
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'read', 'unread'

  /**
   * Fetch messages using API route with admin permissions
   */
  const fetchMessages = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/admin/messages');
      const result = await response.json();
      
      if (result.success) {
        // Convert timestamp objects to Date objects
        const processedMessages = result.data.map(msg => ({
          ...msg,
          createdAt: msg.createdAt ? new Date(msg.createdAt._seconds * 1000) : null,
          updatedAt: msg.updatedAt ? new Date(msg.updatedAt._seconds * 1000) : null
        }));
        setMessages(processedMessages);
      } else {
        throw new Error(result.error || 'Failed to fetch messages');
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      setError(`Erreur de chargement: ${error.message}`);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize messages fetch
  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter and paginate messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(message => {
        if (filterStatus === 'read') return message.read;
        if (filterStatus === 'unread') return !message.read;
        return true;
      });
    }

    return filtered;
  }, [messages, searchTerm, filterStatus]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = filteredMessages.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  /**
   * Enhanced message selection with proper error handling
   */
  const handleSelectMessage = async (msg) => {
    try {
      setSelectedMessage(msg);
      
      if (!msg.read) {
        await toggleReadStatus(msg.id, false);
      }
    } catch (error) {
      setError(`Erreur de sélection: ${error.message}`);
    }
  };

  /**
   * Enhanced read status toggle using API route
   */
  const toggleReadStatus = async (id, currentStatus) => {
    try {
      setActionLoading(`read-${id}`);
      
      const response = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          read: !currentStatus,
          updatedAt: new Date()
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update message');
      }
      
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, read: !currentStatus } : msg
      ));
      
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(prev => ({ ...prev, read: !currentStatus }));
      }
      
    } catch (error) {
      setError(`Erreur de mise à jour: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Enhanced delete functionality
   */
  const handleDeleteClick = (message, event) => {
    if (event) {
      event.stopPropagation();
    }
    setDeleteModal({ isOpen: true, message, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.message) return;
    
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      
      const response = await fetch(`/api/admin/messages?id=${deleteModal.message.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete message');
      }
      
      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== deleteModal.message.id));
      
      if (selectedMessage && selectedMessage.id === deleteModal.message.id) {
        setSelectedMessage(null);
      }
      
      setDeleteModal({ isOpen: false, message: null, loading: false });
    } catch (error) {
      setError(`Erreur de suppression: ${error.message}`);
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Manual refresh functionality
   */
  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    fetchMessages();
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner message="Chargement des messages..." size="lg" variant="dots" />
      </div>
    );
  }

  // Calculate statistics
  const unreadCount = messages.filter(msg => !msg.read).length;
  const readRate = messages.length > 0 ? Math.round(((messages.length - unreadCount) / messages.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-light mb-2">Gestion des Messages</h1>
        <p className="text-primary/70 dark:text-light/70 text-lg mb-6">
          Gérez et répondez aux messages reçus via votre formulaire de contact
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Messages" value={messages.length} icon={FiInbox} />
        <StatCard title="Non Lus" value={unreadCount} icon={FiAlertCircle} />
        <StatCard title="Taux de Lecture" value={readRate} icon={FiCheckSquare} rate />
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/50 dark:text-light/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, sujet ou message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/50 dark:text-light/50 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-primary/20 dark:border-light/20 rounded-lg bg-white dark:bg-primary text-primary dark:text-light focus:ring-2 focus:ring-accent focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">Tous les messages</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-primary/70 dark:text-light/70">
          {filteredMessages.length > 0 ? (
            <>
              Affichage de {startIndex + 1}-{Math.min(endIndex, filteredMessages.length)} sur {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''}
              {searchTerm || filterStatus !== 'all' ? ' (filtré)' : ''}
            </>
          ) : (
            'Aucun message trouvé'
          )}
        </div>
      </div>

      {/* Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="border border-primary/20 dark:border-light/20 rounded-lg h-full flex flex-col">
            <div className="p-4 border-b border-primary/20 dark:border-light/20">
              <h3 className="text-lg font-semibold text-primary dark:text-light">
                Boîte de Réception ({filteredMessages.length})
              </h3>
              {unreadCount > 0 && (
                <p className="text-sm text-primary/70 dark:text-light/70 mt-1">
                  {unreadCount} message{unreadCount !== 1 ? 's' : ''} non lu{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {currentMessages.length > 0 ? (
                currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 cursor-pointer border-b border-primary/20 dark:border-light/20 last:border-b-0 hover:bg-primary/10 dark:hover:bg-light/10 transition-colors ${
                      selectedMessage?.id === msg.id ? 'bg-accent/10 border-l-4 border-l-accent' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-grow">
                        {!msg.read && (
                          <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></span>
                        )}
                        <h4 className={`font-medium truncate ${
                          msg.read ? 'text-primary/70 dark:text-light/70' : 'text-primary dark:text-light'
                        }`}>
                          {msg.name || 'Nom inconnu'}
                        </h4>
                      </div>
                      <span className="text-xs text-primary/60 dark:text-light/60 flex-shrink-0 ml-2">
                        {msg.createdAt ? msg.createdAt.toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </span>
                    </div>
                    <p className="text-sm text-primary/70 dark:text-light/70 truncate mb-1">
                      {msg.email || 'Email inconnu'}
                    </p>
                    <p className="text-sm text-primary/60 dark:text-light/60 line-clamp-2">
                      {msg.message || 'Aucun message'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FiInbox className="w-12 h-12 text-primary/50 dark:text-light/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary dark:text-light mb-2">Aucun message</h3>
                  <p className="text-primary/70 dark:text-light/70 mb-3">
                    {messages.length === 0
                      ? "Aucun message reçu. Les nouveaux messages apparaîtront ici."
                      : "Aucun message ne correspond aux critères de recherche."}
                  </p>
                  {(searchTerm || filterStatus !== 'all') && (
                    <button
                      onClick={() => { setSearchTerm(''); setFilterStatus('all'); setCurrentPage(1); }}
                      className="text-accent hover:text-accent/80 font-medium"
                    >
                      Effacer les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-primary/20 dark:border-light/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-primary/70 dark:text-light/70">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-primary/20 dark:border-light/20 rounded-lg hover:bg-primary/5 dark:hover:bg-light/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-accent text-white'
                                : 'border border-primary/20 dark:border-light/20 hover:bg-primary/5 dark:hover:bg-light/5'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-primary/20 dark:border-light/20 rounded-lg hover:bg-primary/5 dark:hover:bg-light/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="border border-primary/20 dark:border-light/20 rounded-lg h-full flex flex-col">
              <div className="p-6 border-b border-primary/20 dark:border-light/20">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-primary dark:text-light mb-2">
                      {selectedMessage.name || 'Nom inconnu'}
                    </h3>
                    <a 
                      href={`mailto:${selectedMessage.email}`} 
                      className="text-accent hover:underline text-lg font-medium"
                    >
                      {selectedMessage.email || 'Email inconnu'}
                    </a>
                    <p className="text-sm text-primary/70 dark:text-light/70 mt-2">
                      Reçu le {selectedMessage.createdAt ? selectedMessage.createdAt.toLocaleString('fr-FR') : 'Date inconnue'}
                    </p>
                    {selectedMessage.read && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                        ✓ Lu
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.read)}
                      disabled={actionLoading === `read-${selectedMessage.id}`}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        selectedMessage.read
                          ? 'bg-primary/20 dark:bg-light/20 text-primary/70 dark:text-light/70 hover:bg-primary/30 dark:hover:bg-light/30'
                          : 'bg-accent/10 text-accent hover:bg-accent/20'
                      }`}
                      title={selectedMessage.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                    >
                      {actionLoading === `read-${selectedMessage.id}` ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : selectedMessage.read ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(selectedMessage)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Supprimer le message"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow p-6 overflow-y-auto">
                <div className="bg-primary/5 dark:bg-light/5 rounded-lg p-4">
                  <h4 className="font-semibold text-primary dark:text-light mb-2">Sujet:</h4>
                  <p className="text-primary/80 dark:text-light/80 mb-4">
                    {selectedMessage.subject || 'Aucun sujet'}
                  </p>
                  
                  <h4 className="font-semibold text-primary dark:text-light mb-2">Message:</h4>
                  <div className="text-primary/80 dark:text-light/80 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message || 'Aucun message'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-primary/20 dark:border-light/20 rounded-lg h-full flex flex-col items-center justify-center p-8 text-center">
              <FiMail className="w-16 h-16 text-primary/50 dark:text-light/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-primary dark:text-light mb-2">
                Sélectionnez un message
              </h3>
              <p className="text-primary/70 dark:text-light/70">
                Choisissez un message dans la liste pour voir son contenu complet.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, message: null, loading: false })}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le message"
        message={`Êtes-vous sûr de vouloir supprimer le message de "${deleteModal.message?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="delete"
        loading={deleteModal.loading}
      />
    </div>
  );
};

export default ManageMessages;
