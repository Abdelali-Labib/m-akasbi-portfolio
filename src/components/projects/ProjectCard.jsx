"use client";

import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { FaVideo, FaPlay, FaImages, FaCode } from "react-icons/fa";

/**
 * Individual project card component with hover effects and type-specific icons
 * @param {Object} project - Project data object
 * @param {string} type - Project type (video, playlist, image, etc.)
 * @param {Function} onClick - Click handler for project selection
 * @param {number} index - Card index for staggered animations
 */
const ProjectCard = ({ project, type, onClick, index, content = {} }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Animation trigger when card comes into view
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Default content fallbacks
  const defaultContent = {
    views: "vues",
    typeLabels: {
      video: "video",
      playlist: "playlist",
      image: "image"
    }
  };

  // Merge fetched content with defaults
  const pageContent = { ...defaultContent, ...content };

  // Map project types to appropriate icons
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return FaVideo;
      case 'playlist': return FaPlay;
      case 'image': return FaImages;
      default: return FaCode;
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'video': return {
        iconBg: 'bg-gradient-to-br from-accent/20 to-accent/10',
        iconColor: 'text-accent',
        borderColor: 'border-accent/30',
        badgeBg: 'bg-gradient-to-r from-accent/20 to-accent/15',
        badgeBorder: 'border-accent/40'
      };
      case 'playlist': return {
        iconBg: 'bg-gradient-to-br from-accent/15 to-accent/5',
        iconColor: 'text-accent/90',
        borderColor: 'border-accent/25',
        badgeBg: 'bg-gradient-to-r from-accent/15 to-accent/10',
        badgeBorder: 'border-accent/35'
      };
      case 'image': return {
        iconBg: 'bg-gradient-to-br from-accent/25 to-accent/15',
        iconColor: 'text-accent/95',
        borderColor: 'border-accent/35',
        badgeBg: 'bg-gradient-to-r from-accent/25 to-accent/20',
        badgeBorder: 'border-accent/45'
      };
      default: return {
        iconBg: 'bg-gradient-to-br from-accent/20 to-accent/10',
        iconColor: 'text-accent',
        borderColor: 'border-accent/30',
        badgeBg: 'bg-gradient-to-r from-accent/20 to-accent/15',
        badgeBorder: 'border-accent/40'
      };
    }
  };

  const IconComponent = getTypeIcon(type);
  const typeStyle = getTypeStyle(type);

  return (
    <div 
      ref={ref}
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div onClick={onClick} className={`group relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 shadow-lg transition-all duration-500 hover:border-accent/40 hover:shadow-xl hover:scale-105 cursor-pointer ${inView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />
        
        <div className="relative z-10">
          <div className="relative h-48 w-full overflow-hidden">
            {(project.thumbnail || project.img) ? (
              imageError ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  <div className="text-center">
                    <FaImages className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Image non disponible</p>
                  </div>
                </div>
              ) : (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <img
                    src={project.thumbnail || project.img}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <div className="text-center">
                  <FaImages className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune image</p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent dark:from-light/80 dark:via-light/20" />
            
            {/* Type Badge */}
            <div className={`absolute top-4 left-4 px-3 py-1.5 ${typeStyle.badgeBg} ${typeStyle.badgeBorder} border rounded-full backdrop-blur-sm`}>
              <div className="flex items-center gap-2">
                <IconComponent className={`h-3 w-3 ${typeStyle.iconColor}`} />
                <span className="text-xs font-semibold text-primary dark:text-light capitalize">
                  {type}
                </span>
              </div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-accent/90 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-light/20 shadow-xl">
                <FaPlay className="h-6 w-6 text-light ml-1" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-primary dark:text-light mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-300">
              {project.title}
            </h3>
            
            {project.description && (
              <p className="text-sm text-primary/70 dark:text-light/70 line-clamp-2 mb-4">
                {project.description}
              </p>
            )}

            {/* Stats */}
            {(project.views || project.duration) && (
              <div className="flex items-center gap-4 text-xs text-primary/60 dark:text-light/60">
                {project.views && (
                  <span>{project.views} {pageContent.views}</span>
                )}
                {project.duration && (
                  <span>{project.duration}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
