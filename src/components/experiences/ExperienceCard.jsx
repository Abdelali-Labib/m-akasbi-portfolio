"use client";

import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { 
  FaStar, 
  FaUsers, 
  FaRocket, 
  FaChartLine, 
  FaPalette,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaAngleDown,
  FaTools
} from "react-icons/fa";

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

  const IconComponent = getRoleIcon(experience.role);
  const roleColorClasses = getRoleColor(experience.role);
  
  // Check if this is the current position
  const isCurrent =
    (experience.period && experience.period.toLowerCase().includes("aujourd")) ||
    (experience.role && experience.role.toLowerCase().includes("poste actuel"));
  
  // Card expansion state - all cards start collapsed for consistency
  const [open, setOpen] = useState(false);
  
  // Utility to normalize strings for comparison
  const norm = (s) => (s ? String(s).trim().toLowerCase() : "");
  
  // Only show role badge if it's different from the title to avoid duplication
  const showRoleBadge = !!norm(experience.role) && norm(experience.role) !== norm(experience.title);

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


        <div className="p-6 pb-14 pr-14 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
            <div className="flex-1 min-w-0">
              {showRoleBadge && (
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className={`px-3 py-2 bg-gradient-to-r ${roleColorClasses} rounded-xl border ${isCurrent ? 'border-accent/60' : 'border-accent/30'} transition-colors duration-300 flex items-center gap-2`}>
                    <span className="text-accent font-bold text-xs md:text-sm uppercase tracking-wider">
                      {experience.role}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold bg-accent text-light whitespace-nowrap">
                      Poste actuel
                    </span>
                  )}
                  <div className="h-px flex-1 bg-accent/20 hidden lg:block" />
                </div>
              )}

              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary dark:text-light mb-3 leading-tight">
                {experience.title}
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-primary/80 dark:text-light/80">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-sm md:text-base font-medium">{experience.company}</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-accent/50 rounded-full" />
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-sm md:text-base">{experience.period}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
                <IconComponent className="h-5 w-5 text-accent" />
              </div> */}
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
              <p className="text-primary/80 dark:text-light/80 text-sm md:text-base leading-relaxed">
                {experience.description}
              </p>
              {experience.achievements && experience.achievements.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-primary dark:text-light font-semibold mb-2 text-sm md:text-base">
                    Réalisations clés :
                  </h4>
                  <ul className="space-y-1">
                    {experience.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-primary/80 dark:text-light/80 text-sm md:text-base flex items-start gap-2">
                        <span className="text-accent mt-1.5 flex-shrink-0">•</span>
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
