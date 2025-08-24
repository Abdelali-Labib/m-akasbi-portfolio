"use client";

import { useInView } from 'react-intersection-observer';
import CountUp from "react-countup";
import { FiTrendingUp, FiUsers, FiAward, FiStar } from "react-icons/fi";

const icons = [FiTrendingUp, FiUsers, FiAward, FiStar];

const StatItem = ({ stat, icon: IconComponent }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <div ref={ref} className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 bg-gradient-to-br from-white/90 to-white/70 p-6 sm:p-8 backdrop-blur-sm transition-all duration-500 hover:border-accent/40 hover:bg-white/95 hover:shadow-xl hover:shadow-accent/10 hover:scale-105 dark:border-gray-700 dark:from-primary/90 dark:to-primary/70 dark:hover:border-accent/40 dark:hover:bg-primary/95 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/3 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="relative z-10 mb-4 sm:mb-6 flex justify-center">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 text-accent transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-accent/30 group-hover:to-accent/20 shadow-lg">
          <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
        {inView && (
          <CountUp
            end={stat.number}
            duration={3}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent"
          />
        )}
        {!inView && <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent">0</span>}
        <p className="text-xs sm:text-sm lg:text-base font-semibold leading-relaxed text-gray-700 dark:text-gray-300 px-2">
          {stat.text}
        </p>
      </div>
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent transition-all duration-500 group-hover:border-accent/20"></div>
      <div className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-accent/40 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150"></div>
    </div>
  );
}

function Statistics({ statistics = [], content = {} }) {
  // Simple fallback if anything goes wrong
  try {
    const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.2,
    });

    // Default content fallbacks
    const defaultContent = {
      title: "Mon parcours en chiffres",
      description: "Quelques statistiques qui reflètent mon expérience et mes réalisations dans le domaine de l'audiovisuel"
    };

    // Merge fetched content with defaults
    const pageContent = { ...defaultContent, ...content };

    // Ensure statistics is always an array
    const safeStatistics = Array.isArray(statistics) ? statistics : [];
    
    // Don't render if no statistics
    if (safeStatistics.length === 0) {
      return null;
    }

    // Validate statistics structure
    const validStatistics = safeStatistics.filter(stat => 
      stat && typeof stat === 'object' && 
      (typeof stat.number === 'number' || typeof stat.number === 'string') &&
      typeof stat.text === 'string'
    );

    if (validStatistics.length === 0) {
      return null;
    }

    return (
      <section ref={ref} className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className={`mb-12 sm:mb-16 text-center transition-opacity duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="h3 mb-4 sm:mb-6 text-gray-700 dark:text-gray-300 font-bold text-xl sm:text-2xl lg:text-3xl">
              {pageContent.title}
            </h2>
            <div className="mx-auto h-1 w-20 sm:w-32 bg-gradient-to-r from-accent/50 via-accent to-accent/50 rounded-full"></div>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {pageContent.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 text-center">
            {validStatistics.map((stat, index) => (
              <StatItem key={index} stat={stat} icon={icons[index] || FiTrendingUp} />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    
    
    // Return a simple fallback component
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="h3 mb-4 sm:mb-6 text-gray-700 dark:text-gray-300 font-bold text-xl sm:text-2xl lg:text-3xl">
              Mon parcours en chiffres
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Erreur lors du chargement des statistiques
            </p>
          </div>
        </div>
      </section>
    );
  }
}

export default Statistics;
