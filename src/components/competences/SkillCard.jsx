"use client";

import React from "react";
import { useInView } from "react-intersection-observer";
import { FaCrown, FaFire, FaStar, FaGem } from "react-icons/fa";
import NextImage from "next/image";

/**
 * Individual skill card component with animated progress bar and level indicator
 * @param {Object} skill - Skill data object containing name, icon, and percentage
 * @param {number} index - Card index for staggered animations
 * @param {number} animatedPercentage - Current animated percentage value
 */
const SkillCard = ({ skill, index, animatedPercentage }) => {
  // Animation trigger when card comes into view
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Determine skill level based on percentage with appropriate icon and color
  const getSkillLevel = (percentage) => {
    if (percentage >= 90) return { level: "Expert", icon: FaCrown, color: "from-accent to-accent/80" };
    if (percentage >= 75) return { level: "Avancé", icon: FaFire, color: "from-accent/90 to-accent/70" };
    if (percentage >= 60) return { level: "Intermédiaire", icon: FaStar, color: "from-accent/80 to-accent/60" };
    return { level: "Débutant", icon: FaGem, color: "from-accent/70 to-accent/50" };
  };

  const skillLevel = getSkillLevel(animatedPercentage);
  const LevelIcon = skillLevel.icon;

  return (
    <div 
      ref={ref}
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Modern Skill Card */}
      <div className={`group relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 shadow-lg transition-all duration-500 hover:border-accent/40 hover:shadow-xl hover:scale-105 ${inView ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-ping" />
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-accent/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-ping delay-300" />
        
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {/* Icon Section */}
            <div className="relative">
              {typeof skill.icon === "string" ? (
                <div className="relative">
                  <NextImage
                    src={skill.icon}
                    alt={skill.name}
                    width={72}
                    height={72}
                    className="h-12 w-12 sm:h-16 sm:w-16 lg:h-18 lg:w-18 transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 bg-accent/30 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="relative">
                  <div className="text-4xl sm:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-110">
                    {skill.icon}
                  </div>
                  {/* Enhanced Glow Effect */}
                  <div className="absolute inset-0 bg-accent/30 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
            </div>

            {/* Skill Level Badge */}
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r ${skillLevel.color} rounded-full text-light text-xs sm:text-sm font-bold shadow-lg`}>
              {LevelIcon && <LevelIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span>{skillLevel.level}</span>
            </div>
          </div>

          {/* Skill Name */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary dark:text-light leading-tight group-hover:text-accent transition-colors duration-300">
              {skill.name}
            </h3>
          </div>

          {/* Enhanced Progress Section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Progress Bar Container */}
            <div className="relative">
              {/* Background Track */}
              <div className="h-3 sm:h-4 w-full overflow-hidden rounded-full bg-primary/10 dark:bg-light/10 backdrop-blur-sm border border-accent/10">
                {/* Animated Progress Fill */}
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-accent/80 via-accent to-accent/90 transition-all duration-1000 ease-out overflow-hidden"
                  style={{ width: `${animatedPercentage}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-light/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                  
                  {/* Progress Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/60 to-accent/40 rounded-full blur-sm" />
                </div>
              </div>
              
              {/* Percentage Indicator */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center text-light text-xs font-bold shadow-lg border-2 border-light">
                {animatedPercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
