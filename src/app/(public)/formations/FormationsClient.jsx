"use client";
import React, { useState } from "react";
import { 
  FaGraduationCap, 
  FaUniversity, 
  FaCertificate, 
  FaAward,
  FaChevronDown
} from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import AnimatedItem from "@/components/ui/AnimatedItem";
import HeroSection from "@/components/ui/HeroSection";

/**
 * Individual timeline item for education/formation entries
 */
const TimelineItem = ({ formation, index, isOpen, onToggle }) => {
  // Animation trigger when item comes into view
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Map formation types to appropriate icons
  const getIcon = (type) => {
    if (!type) return FaCertificate;
    const lowerType = type.toLowerCase();
    if (lowerType.includes('master')) return FaGraduationCap;
    if (lowerType.includes('licence')) return FaUniversity;
    if (lowerType.includes('certification')) return FaCertificate;
    if (lowerType.includes('baccalauréat')) return FaAward;
    if (lowerType.includes('diplôme universitaire')) return FaUniversity;
    return FaCertificate;
  };

  const IconComponent = getIcon(formation.name);

  return (
    <div 
      ref={ref} 
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <div className="relative">
        <div className="hidden lg:block absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/20 via-accent/40 to-accent/20">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-accent/10 via-accent/20 to-transparent blur-sm" />
        </div>
        <div className="lg:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/60 via-accent/40 to-accent/20" />
        
        <div className="relative flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-12 pl-0 lg:pl-24">
          <div className="relative z-10 flex items-start justify-start lg:justify-start">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 shadow-lg sm:shadow-xl lg:shadow-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 relative overflow-hidden border-2 border-light/20 dark:border-primary/20">
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-light z-10 relative" />
                <div className="absolute inset-0 bg-gradient-to-br from-light/20 to-transparent scale-0 group-hover:scale-100 transition-transform duration-700 rounded-2xl lg:rounded-3xl" />
              </div>
              <div className="absolute -top-4 -right-1 sm:-top-3 sm:-right-2 lg:-top-3 lg:-right-3 px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3 lg:py-1.5 bg-gradient-to-r from-accent to-accent/80 rounded-full text-[10px] sm:text-xs font-bold text-light shadow-lg z-20">
                {formation.year}
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 ml-4 sm:ml-6 lg:ml-0 relative z-10">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-accent/25 bg-gradient-to-br from-light/98 to-light/92 dark:from-primary/98 dark:to-primary/92 backdrop-blur-sm shadow-lg sm:shadow-xl lg:shadow-2xl hover:shadow-xl lg:hover:shadow-3xl transition-all duration-700 hover:border-accent/50 group-hover:scale-[1.01] lg:group-hover:scale-[1.02]">
              <button
                onClick={onToggle}
                className="w-full p-4 sm:p-5 lg:p-8 text-left transition-all duration-500 hover:bg-accent/5 dark:hover:bg-primary/90 relative z-10"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4 lg:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg sm:rounded-xl lg:rounded-2xl border border-accent/30 group-hover:border-accent/50 transition-colors duration-300 text-accent font-semibold text-xs lg:text-sm uppercase tracking-wider">
                        {formation.name}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-primary dark:text-light mb-3 leading-tight group-hover:text-accent transition-colors duration-500">
                      {formation.title}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 text-primary/80 dark:text-light/80">
                      <FaUniversity className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent/80" />
                      <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium truncate">{formation.institution}</span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 transform transition-all duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-accent/15 to-accent/10 flex items-center justify-center group-hover:bg-accent/25 transition-all duration-500 group-hover:scale-110 border border-accent/25 group-hover:border-accent/40 shadow-lg">
                      <FaChevronDown className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent" />
                    </div>
                  </div>
                </div>
              </button>
              <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isOpen ? 'max-h-[400px]' : 'max-h-0'}`}>
                <div className="border-t border-accent/25 p-4 sm:p-5 lg:p-8 dark:border-accent/35 relative z-10 bg-gradient-to-br from-accent/5 to-transparent">
                  <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-primary/90 dark:text-light/90">
                    {formation.description}
                    {formation.skills && formation.skills.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm sm:text-base font-bold text-primary dark:text-light mb-2">Compétences</h4>
                        <ul className="flex flex-wrap gap-2">
                          {formation.skills.map((skill, index) => (
                            <li key={index} className="bg-accent/10 text-accent text-xs sm:text-sm font-medium rounded-full px-2 py-1">{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormationsClient = ({ formations }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <HeroSection 
        icons={[FaAward, FaGraduationCap, FaCertificate]}
        title="Formations &"
        accentWord="Certifications"
        description="Un voyage d'apprentissage continu qui m'a permis d'acquérir des compétences variées et de me spécialiser dans différents domaines clés de l'industrie."
      />

      <section className="py-16 lg:py-24">
        <div className="page-container">
          <AnimatedItem delay={200}>
            <div className="text-center mb-16 lg:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary dark:text-light mb-6 lg:mb-8">
                Mon <span className="text-accent">Parcours</span> Chronologique
              </h2>
              <p className="text-base lg:text-lg leading-relaxed text-primary/80 dark:text-light/80 mb-4">
                De mes débuts académiques à mes spécialisations actuelles, découvrez les étapes clés de mon évolution professionnelle.
              </p>
              <div className="w-24 sm:w-32 lg:w-40 h-1 lg:h-1.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30 rounded-full mx-auto" />
            </div>
          </AnimatedItem>
          
          <div className="space-y-8 lg:space-y-16 relative">
            {formations.map((formation, index) => (
              <TimelineItem
                key={formation.id}
                formation={formation}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FormationsClient;
