"use client";

import React from 'react';
import AnimatedItem from './AnimatedItem';

/**
 * Reusable hero section component with animated icons, title, and description
 * @param {Array} icons - Array of 3 React icon components for the journey display
 * @param {string} title - Main title text
 * @param {string} accentWord - Highlighted word in the title
 * @param {string} description - Descriptive text below the title
 * @param {string} className - Additional CSS classes
 */
const HeroSection = ({ 
  icons, 
  title, 
  accentWord, 
  description, 
  className = "" 
}) => {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      
      
      <div className="page-container relative z-10 flex flex-col justify-center">
        <div className="page-content">
          <div className="text-center mb-16 lg:mb-20">
            <AnimatedItem delay={200}>
              <div className="relative inline-block mb-12 lg:mb-16">
                {/* Three-Icon Journey */}
                <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-8">
                  {/* First Icon */}
                  <div className="group relative">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-accent/30 shadow-lg lg:shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                      {icons[0] && React.createElement(icons[0], { className: "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 text-accent group-hover:text-accent/80 transition-colors duration-300" })}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                    </div>
                  </div>
                  
                  {/* Progress Arrow */}
                  <div className="w-6 sm:w-8 md:w-12 lg:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-full animate-pulse" />
                  </div>
                  
                  {/* Middle Icon - Larger */}
                  <div className="group relative">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-accent/30 to-accent/20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-accent/40 shadow-xl lg:shadow-2xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                      {icons[1] && React.createElement(icons[1], { className: "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 text-accent group-hover:text-accent/80 transition-colors duration-300" })}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                  </div>
                  
                  {/* Progress Arrow */}
                  <div className="w-6 sm:w-8 md:w-12 lg:w-16 h-0.5 sm:h-1 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-full animate-pulse" />
                  </div>
                  
                  {/* Third Icon */}
                  <div className="group relative">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-accent/30 shadow-lg lg:shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                      {icons[2] && React.createElement(icons[2], { className: "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 text-accent group-hover:text-accent/80 transition-colors duration-300" })}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedItem>
            
            <AnimatedItem delay={400}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary dark:text-light leading-tight mb-8 lg:mb-10">
                {title}{' '}
                <span className="text-accent relative inline-block">
                  {accentWord}
                  <div className="absolute -bottom-3 lg:-bottom-6 left-0 w-full h-2 lg:h-3 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-full" />
                </span>
              </h1>
            </AnimatedItem>
            
            <AnimatedItem delay={600}>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed text-primary/80 dark:text-light/80 max-w-4xl lg:max-w-5xl mx-auto mb-12 lg:mb-16 px-4">
                {description}
              </p>
            </AnimatedItem>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
