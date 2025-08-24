"use client";

import React, { useState, useEffect } from 'react';

const ProjectForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [],
    type: 'image',
    imageUrl: '',
    videoUrl: '',
    playlistUrl: '',
    githubUrl: '',
    liveUrl: '',
    order: 0,
  });
  const [techInput, setTechInput] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        technologies: initialData.technologies || [],
        type: initialData.type || 'image',
        imageUrl: initialData.imageUrl || initialData.img || '',
        videoUrl: initialData.videoUrl || initialData.url || '',
        playlistUrl: initialData.playlistUrl || initialData.url || '',
        githubUrl: initialData.githubUrl || '',
        liveUrl: initialData.liveUrl || '',
        order: initialData.order || 0,
      });
      if (initialData.technologies && Array.isArray(initialData.technologies)) {
        setTechInput(initialData.technologies.join(', '));
      } else {
        setTechInput('');
      }
    } else {
      setFormData({
        title: '',
        description: '',
        technologies: [],
        type: 'image',
        imageUrl: '',
        videoUrl: '',
        playlistUrl: '',
        githubUrl: '',
        liveUrl: '',
        order: 0,
      });
      setTechInput('');
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'order' ? parseInt(value, 10) : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleTechInputChange = (e) => {
    setTechInput(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setFormData({ ...formData, imageUrl: data.url });
    } catch (error) {
      console.error(error);
      alert('Erreur lors du téléchargement du fichier.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const technologies = techInput.split(',').map(t => t.trim()).filter(t => t);
    onSubmit({ ...formData, technologies });
  };

  return (
    <div className="border border-primary/20 dark:border-light/20 rounded-lg p-6 mb-8 bg-white dark:bg-primary">
      <h2 className="text-xl font-semibold mb-6 text-primary dark:text-light">{initialData ? 'Modifier Projet' : 'Ajouter Projet'}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Titre du Projet</label>
            <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Titre du Projet" className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" rows="3" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Technologies (séparées par des virgules)</label>
            <input name="technologies" value={techInput} onChange={handleTechInputChange} placeholder="React, Node.js, MongoDB" className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">URL GitHub</label>
            <input name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="https://github.com/..." className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">URL en Direct</label>
            <input name="liveUrl" value={formData.liveUrl} onChange={handleInputChange} placeholder="https://..." className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Type</label>
            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="playlist">Playlist</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary dark:text-light">Ordre</label>
            <input type="number" name="order" value={formData.order} onChange={handleInputChange} placeholder="0" className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required />
          </div>

          {formData.type === 'image' && (
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-primary dark:text-light">Image du Projet</label>
              <div className="flex items-center gap-4">
                <input type="file" onChange={handleFileChange} className="w-full p-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" />
                <button type="button" onClick={handleUpload} disabled={!file || uploading} className="px-4 py-2 bg-accent text-white rounded disabled:bg-accent/50">
                  {uploading ? 'Téléchargement...' : 'Télécharger'}
                </button>
              </div>
              {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="w-32 h-auto mt-4 rounded-lg" />}
            </div>
          )}
          {formData.type === 'video' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-primary dark:text-light">URL Vidéo YouTube</label>
              <input name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required />
            </div>
          )}
          {formData.type === 'playlist' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-primary dark:text-light">URL Playlist YouTube</label>
              <input name="playlistUrl" value={formData.playlistUrl} onChange={handleInputChange} placeholder="https://youtube.com/playlist?list=..." className="w-full px-3 py-2 rounded border border-primary/20 dark:border-light/20 bg-white dark:bg-primary text-primary dark:text-light" required />
            </div>
          )}

          <div className="md:col-span-2 flex items-center gap-3 pt-4">
            <button type="submit" className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors">{initialData ? 'Mettre à Jour' : 'Sauvegarder'}</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-primary/10 dark:bg-light/10 text-primary dark:text-light rounded hover:bg-primary/20 dark:hover:bg-light/20 transition-colors">Annuler</button>
          </div>
        </form>
    </div>
  );
};

export default ProjectForm;
