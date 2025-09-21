"use client";
import React, { useState } from "react";
import { 
  FaGraduationCap, 
  FaUniversity, 
  FaCertificate, 
  FaAward
} from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import AnimatedItem from "@/components/ui/AnimatedItem";
import HeroSection from "@/components/ui/HeroSection";

/**
 * Formation card component without toggle functionality
 */
const FormationCard = ({ formation, index }) => {
  // Animation trigger when item comes into view
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Map formation types to appropriate icons
  const getIcon = (formation) => {
    if (formation.type === 'certificate') return FaCertificate;
    if (formation.type === 'academic') {
      const name = (formation.name || '').toLowerCase();
      if (name.includes('master')) return FaGraduationCap;
      if (name.includes('licence')) return FaUniversity;
      if (name.includes('baccalauréat')) return FaAward;
      if (name.includes('diplôme universitaire')) return FaUniversity;
      return FaGraduationCap;
    }
    return FaCertificate;
  };

  const IconComponent = getIcon(formation);

  return (
    <div 
      ref={ref} 
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-light/98 to-light/92 dark:from-primary/98 dark:to-primary/92 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 hover:border-accent/40 group-hover:scale-[1.02]">
        <div className="p-6 relative">
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-500 border-2 border-light/20 dark:border-primary/20">
                <IconComponent className="h-7 w-7 text-light" />
              </div>
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-accent to-accent/80 rounded-full text-xs font-bold text-light shadow-lg">
                {formation.year}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-2xl font-bold text-primary dark:text-light mb-4 leading-tight group-hover:text-accent transition-colors duration-500">
                {formation.name || formation.title}
              </h3>
              
              <div className="space-y-3 text-primary/80 dark:text-light/80">
                <div className="flex items-center gap-2">
                  <FaUniversity className="h-4 w-4 text-accent/70 flex-shrink-0" />
                  <span className="text-sm md:text-base font-medium">{formation.institution}</span>
                </div>
                
                {formation.speciality && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm md:text-base text-primary/60 dark:text-light/60 font-medium min-w-0">
                      <span className="text-accent font-semibold">Spécialité:</span> {formation.speciality}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormationsClient = ({ formations }) => {
  const [activeTab, setActiveTab] = useState('academic');

  // Filter formations by type
  const academicFormations = formations.filter(f => f.type === 'academic').sort((a, b) => (b.year || 0) - (a.year || 0));
  const certifications = formations.filter(f => f.type === 'certificate').sort((a, b) => (b.year || 0) - (a.year || 0));

  const handleTabKey = (e) => {
    const order = ['academic', 'certificate'];
    const idx = order.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      setActiveTab(order[(idx + 1) % order.length]);
    } else if (e.key === 'ArrowLeft') {
      setActiveTab(order[(idx - 1 + order.length) % order.length]);
    }
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
                Mon <span className="text-accent">Parcours</span> Éducatif
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-primary/80 dark:text-light/80 max-w-3xl lg:max-w-4xl mx-auto mb-8 lg:mb-10 px-4">
                Découvrez mon parcours académique et mes certifications professionnelles.
              </p>
              <div className="w-24 sm:w-32 lg:w-40 h-1 lg:h-1.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30 rounded-full mx-auto" />
            </div>
          </AnimatedItem>
          
          <div
            role="tablist"
            aria-label="Formation Tabs"
            className="mx-auto mb-10 lg:mb-12 flex w-full max-w-3xl md:justify-center rounded-2xl border border-accent/20 bg-gradient-to-br from-light/80 to-light/70 dark:from-primary/80 dark:to-primary/70 backdrop-blur-sm overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal"
            onKeyDown={handleTabKey}
          >
            <button
              role="tab"
              aria-selected={activeTab === 'academic'}
              tabIndex={activeTab === 'academic' ? 0 : -1}
              onClick={() => setActiveTab('academic')}
              className={`flex-none w-1/2 sm:w-auto md:flex-1 px-4 py-3 lg:px-6 lg:py-4 text-sm lg:text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                activeTab === 'academic'
                  ? 'text-light bg-accent'
                  : 'text-primary/80 dark:text-light/80 hover:bg-accent/10'
              }`}
            >
              Parcours Académique
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'certificate'}
              tabIndex={activeTab === 'certificate' ? 0 : -1}
              onClick={() => setActiveTab('certificate')}
              className={`flex-none w-1/2 sm:w-auto md:flex-1 px-4 py-3 lg:px-6 lg:py-4 text-sm lg:text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 border-l border-accent/20 ${
                activeTab === 'certificate'
                  ? 'text-light bg-accent'
                  : 'text-primary/80 dark:text-light/80 hover:bg-accent/10'
              }`}
            >
              Certifications
            </button>
          </div>

          {activeTab === 'academic' && (
            <div role="tabpanel" aria-labelledby="tab-academic" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {academicFormations && academicFormations.length > 0 ? (
                academicFormations.map((formation, index) => (
                  <FormationCard
                    key={formation.id}
                    formation={formation}
                    index={index}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-primary/70 dark:text-light/70">
                    Aucune formation académique à afficher pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'certificate' && (
            <div role="tabpanel" aria-labelledby="tab-certificate" className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {certifications && certifications.length > 0 ? (
                certifications.map((formation, index) => (
                  <FormationCard
                    key={formation.id}
                    formation={formation}
                    index={index}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-primary/70 dark:text-light/70">
                    Aucune certification à afficher pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default FormationsClient;
