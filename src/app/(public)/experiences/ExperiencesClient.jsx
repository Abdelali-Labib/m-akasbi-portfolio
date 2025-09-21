"use client";
import React, { useState } from "react";
import {
  FaStar,
  FaUsers,
  FaRocket,
  FaChartLine,
  FaTrophy,
  FaPalette,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaAngleDown,
  FaTools,
  FaClock,
} from "react-icons/fa";
import { HiOutlineOfficeBuilding, HiOutlineLocationMarker } from 'react-icons/hi';
import { useInView } from "react-intersection-observer";
import AnimatedItem from "@/components/ui/AnimatedItem";
import HeroSection from "@/components/ui/HeroSection";
import ExperienceCard from "@/components/experiences/ExperienceCard";
import FilmExperienceCard from "@/components/experiences/FilmExperienceCard";

const ExperiencesClient = ({ workExperiences, filmExperiences }) => {
  const [activeTab, setActiveTab] = useState('work'); // 'work' | 'films'
  
  // Sort experiences: current position first, then by startYear (newest first)
  const sortedWorkExperiences = [...workExperiences].sort((a, b) => {
    // Current position always comes first
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    
    // If both are current or both are not current, sort by startYear (newest first)
    const aYear = parseInt(a.startYear) || 0;
    const bYear = parseInt(b.startYear) || 0;
    return bYear - aYear;
  });

  const handleTabKey = (e) => {
    const order = ['work', 'films'];
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
        icons={[FaBriefcase, FaChartLine, FaStar]}
        title="Expériences"
        accentWord="Professionnelles"
        description="Un parcours professionnel riche et varié, marqué par l'innovation, la croissance continue et l'excellence dans chaque mission."
      />

      <section className="py-16 lg:py-24">
        <div className="page-container">
          <AnimatedItem delay={200}>
            <div className="text-center mb-16 lg:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary dark:text-light mb-6 lg:mb-8">
                Mon <span className="text-accent">Parcours</span> Professionnel
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-primary/80 dark:text-light/80 max-w-3xl lg:max-w-4xl mx-auto mb-8 lg:mb-10 px-4">
                Découvrez mes expériences professionnelles et ma filmographie dans une vue unifiée.
              </p>
              <div className="w-24 sm:w-32 lg:w-40 h-1 lg:h-1.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30 rounded-full mx-auto" />
            </div>
          </AnimatedItem>
          <div
            role="tablist"
            aria-label="Parcours Tabs"
            className="mx-auto mb-10 lg:mb-12 flex w-full max-w-3xl md:justify-center rounded-2xl border border-accent/20 bg-gradient-to-br from-light/80 to-light/70 dark:from-primary/80 dark:to-primary/70 backdrop-blur-sm overflow-x-auto md:overflow-visible whitespace-nowrap md:whitespace-normal"
            onKeyDown={handleTabKey}
          >
            <button
              role="tab"
              aria-selected={activeTab === 'work'}
              tabIndex={activeTab === 'work' ? 0 : -1}
              onClick={() => setActiveTab('work')}
              className={`flex-none w-1/2 sm:w-auto md:flex-1 px-4 py-3 lg:px-6 lg:py-4 text-sm lg:text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                activeTab === 'work'
                  ? 'text-light bg-accent'
                  : 'text-primary/80 dark:text-light/80 hover:bg-accent/10'
              }`}
            >
              Expériences
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'films'}
              tabIndex={activeTab === 'films' ? 0 : -1}
              onClick={() => setActiveTab('films')}
              className={`flex-none w-1/2 sm:w-auto md:flex-1 px-4 py-3 lg:px-6 lg:py-4 text-sm lg:text-base font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 border-l border-accent/20 ${
                activeTab === 'films'
                  ? 'text-light bg-accent'
                  : 'text-primary/80 dark:text-light/80 hover:bg-accent/10'
              }`}
            >
              Filmographie
            </button>
          </div>

          {activeTab === 'work' && (
            <div role="tabpanel" aria-labelledby="tab-work" className="space-y-8 lg:space-y-16">
              {sortedWorkExperiences && sortedWorkExperiences.length > 0 ? (
                sortedWorkExperiences.map((experience, index) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-primary/70 dark:text-light/70">
                    Aucune expérience professionnelle à afficher pour le moment.
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'films' && (
            <div role="tabpanel" aria-labelledby="tab-films" className="space-y-6 lg:space-y-8">
              {filmExperiences && filmExperiences.length > 0 ? (
                filmExperiences.map((item, index) => (
                  <FilmExperienceCard key={item.id} experience={item} index={index} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-primary/70 dark:text-light/70">
                    Aucune expérience cinématographique à afficher pour le moment.
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

export default ExperiencesClient;
