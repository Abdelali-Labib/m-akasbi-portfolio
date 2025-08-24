"use client";

import React from "react";
import { useInView } from "react-intersection-observer";
import { FaTools, FaLightbulb, FaGlobe, FaStar } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

/**
 * Category selection card component for skill categories
 * @param {Object} section - Section data containing name and skills array
 * @param {number} index - Card index for animations and icon selection
 * @param {boolean} isActive - Whether this category is currently selected
 * @param {Function} onClick - Click handler for category selection
 */
const CategoryCard = ({ section, index, isActive, onClick }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const getCategoryIcon = (index) => {
    switch (index) {
      case 0: return FaTools;
      case 1: return FaLightbulb;
      case 2: return FaGlobe;
      default: return FaStar;
    }
  };

  const IconComponent = getCategoryIcon(index);

  return (
    <div 
      ref={ref}
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <button
        onClick={onClick}
        className={`relative w-full transform rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:scale-105 active:scale-95 ${
          isActive
            ? "bg-gradient-to-br from-accent to-accent/90 text-light shadow-2xl shadow-accent/30 border-2 border-accent/60"
            : "bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 text-primary dark:text-light border-2 border-accent/20 shadow-xl backdrop-blur-sm hover:border-accent/40 hover:shadow-2xl hover:bg-light/98 dark:hover:bg-primary/98"
        }`}
      >
        {/* Background Effects */}
        <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 transition-opacity duration-300 ${
          isActive ? "bg-accent/20" : "bg-accent/10"
        } group-hover:opacity-100`}></div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          {/* Icon */}
          <div className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
            isActive 
              ? "bg-light/20 text-light" 
              : "bg-accent/10 text-accent group-hover:bg-accent/20"
          }`}>
            <IconComponent className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          
          {/* Text */}
          <div className="text-left flex-1">
            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl">{section.name}</h3>
            <p className={`text-sm sm:text-base ${isActive ? "text-light/80" : "text-primary/70 dark:text-light/70"}`}>
              {section.data.length} compétences
            </p>
          </div>
          
          {/* Arrow */}
          <div className={`transition-all duration-300 ${
            isActive ? "text-light" : "text-accent"
          }`}>
            <IoIosArrowForward className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent/20 animate-pulse"></div>
        )}
      </button>
    </div>
  );
};

export default CategoryCard;
