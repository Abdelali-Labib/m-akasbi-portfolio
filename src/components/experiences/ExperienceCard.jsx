"use client";

import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { 
  FaStar, 
  FaUsers, 
  FaRocket, 
  FaChartLine, 
  FaPalette,
  FaAngleDown,
  FaTools,
  FaBriefcase,
  FaClock
} from "react-icons/fa";
import { HiOutlineOfficeBuilding, HiOutlineLocationMarker } from 'react-icons/hi';

/**
 * Experience card component with expandable details and role-based styling
 * @param {Object} experience - Experience data object
 * @param {number} index - Card index for staggered animations
 */
const ExperienceCard = ({ experience, index }) => {
  // Animation trigger when card comes into view
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Map role names to appropriate icons
  const getRoleIcon = (role) => {
    if (!role) return FaBriefcase; // Default icon if role is missing
    const r = role.toLowerCase();
    if (r.includes('réalisateur')) return FaStar;
    if (r.includes('formateur') || r.includes('professeur')) return FaUsers;
    if (r.includes('infograph') || r.includes('vidéo')) return FaPalette;
    if (r.includes('monteur') || r.includes('cameraman')) return FaRocket;
    if (r.includes('technicien')) return FaTools;
    if (r.includes('lead') || r.includes('manager')) return FaChartLine;
    return FaBriefcase;
  };

  // Consistent color scheme for all role badges
  const getRoleColor = () => 'from-accent/20 to-accent/10';

  const IconComponent = getRoleIcon(experience.position);
  const roleColorClasses = getRoleColor(experience.position);
  
  // Check if this is the current position
  const isCurrent = experience.current === true;
  
  // Calculate duration
  const calculateDuration = (startYear, endYear, isCurrent) => {
    const start = parseInt(startYear);
    const end = isCurrent ? new Date().getFullYear() : parseInt(endYear);
    
    if (!start || isNaN(start)) return null;
    if (!end || isNaN(end)) return null;
    
    const duration = end - start + 1;
    if (duration === 1) return '1 an';
    return `${duration} ans`;
  };
  
  const duration = calculateDuration(experience.startYear, experience.endYear, isCurrent);
  
  // Card expansion state - all cards start collapsed for consistency
  const [open, setOpen] = useState(false);
  
  // Utility to normalize strings for comparison
  const norm = (s) => (s ? String(s).trim().toLowerCase() : "");
  
  // Only show role badge if it's different from the position to avoid duplication
  const showRoleBadge = !!norm(experience.position) && norm(experience.position) !== norm(experience.title);

  return (
    <div 
      ref={ref}
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      {/* Simplified Experience Card */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={`exp-${index}-content`}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className={`relative overflow-hidden rounded-2xl border ${isCurrent ? 'border-accent/60' : 'border-accent/20'} bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 shadow-lg transition-all duration-500 hover:border-accent/40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`}
      >


        <div className="p-4 sm:p-6 pb-14 pr-14 relative z-10">
          {/* Year in top right */}
          <div className="absolute top-4 right-4 z-20">
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-accent text-light shadow-sm">
              {experience.startYear}{experience.endYear && !isCurrent && ` - ${experience.endYear}`}{isCurrent && ' - Présent'}
            </span>
          </div>

          <div className="pt-8 sm:pt-10">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex-1 min-w-0">
                {isCurrent && (
                  <div className="inline-flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent text-light whitespace-nowrap">
                      Poste Actuel
                    </span>
                    <div className="h-px flex-1 bg-accent/20 hidden lg:block" />
                  </div>
                )}

                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary dark:text-light mb-3 leading-tight">
                  {experience.position || experience.title}
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-primary/80 dark:text-light/80">
                  <div className="flex items-center gap-2">
                    <HiOutlineOfficeBuilding className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-sm md:text-base font-medium">{experience.place || experience.company}</span>
                  </div>
                  {experience.location && (
                    <>
                      <div className="hidden sm:block w-1 h-1 bg-accent/50 rounded-full" />
                      <div className="flex items-center gap-2">
                        <HiOutlineLocationMarker className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-sm md:text-base">{experience.location}</span>
                      </div>
                    </>
                  )}
                  {duration && (
                    <>
                      <div className="hidden sm:block w-1 h-1 bg-accent/50 rounded-full" />
                      <div className="flex items-center gap-2">
                        <FaClock className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-sm md:text-base font-medium">{duration}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Content */}
          <div
            id={`exp-${index}-content`}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-4 border-t border-accent/20">
              {experience.achievements && experience.achievements.length > 0 && (
                <div>
                  <ul className="space-y-2">
                    {experience.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-primary/80 dark:text-light/80 text-sm md:text-base flex items-baseline gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/50 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expand/Collapse Indicator */}
        <div className="absolute bottom-4 right-4">
          <div className={`p-2 rounded-full bg-accent/10 border border-accent/20 transition-all duration-300 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}>
            <FaAngleDown className="h-4 w-4 text-accent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
