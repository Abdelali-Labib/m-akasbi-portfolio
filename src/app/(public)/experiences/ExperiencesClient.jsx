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
import { useInView } from "react-intersection-observer";
import AnimatedItem from "@/components/ui/AnimatedItem";
import HeroSection from "@/components/ui/HeroSection";
import ExperienceCard from "@/components/experiences/ExperienceCard";

const FilmExperienceCard = ({ item, index }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [open, setOpen] = useState(false);

  const hasRoles = Array.isArray(item.roles) && item.roles.length > 0;
  const norm = (s) => (s ? String(s).trim().toLowerCase() : '');

  const uniqueRoles = hasRoles
    ? Array.from(new Map(item.roles.map((r) => [norm(r), r])).values())
    : [];

  const filteredRoles = uniqueRoles.filter((r) => norm(r) !== norm(item.position));
  const showPosition = !hasRoles || filteredRoles.length === 0;

  const clean = (v) => {
    const s = (v ?? '').toString().trim();
    if (s === '' || s === '-' || s === '—') return '';
    return s;
  };
  const company = clean(item.company);
  const hasMeta = !!company;

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={`film-${index}-content`}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 backdrop-blur-sm shadow-lg transition-all duration-500 hover:border-accent/40 cursor-pointer"
      >
        <div className="p-6 pb-14 pr-14 relative">
          <div className="mb-2">
            <div className="min-w-0">
              <h3 className="text-2xl md:text-3xl font-bold text-primary dark:text-light mb-2 leading-tight group-hover:text-accent transition-colors duration-500 line-clamp-2">
                {item.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {item.type && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent/15 text-accent border border-accent/30">
                    {item.type}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-primary/80 dark:text-light/80">
                {showPosition && item.position && (
                  <span className="text-sm md:text-base font-medium">{item.position}</span>
                )}
                {item.location && (
                  <span className="inline-flex items-center gap-2 text-sm md:text-base">
                    <FaMapMarkerAlt className="h-4 w-4 text-accent/70" />
                    {item.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {filteredRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {filteredRoles.map((r, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                  {r}
                </span>
              ))}
            </div>
          )}

          <div id={`film-${index}-content`} className={`transition-all duration-400 ease-in-out overflow-hidden ${open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="h-px w-full bg-accent/15 my-3" />
            {hasMeta && (
              <div className="mb-2 flex items-center gap-2 text-primary/70 dark:text-light/70">
                <FaUsers className="h-4 w-4 text-accent/60" />
                <span className="text-sm md:text-base">{company}</span>
              </div>
            )}
            {item.responsibilities && item.responsibilities.length > 0 && (
              <ul className="list-disc pl-5 text-sm md:text-base text-primary/80 dark:text-light/80 space-y-1">
                {item.responsibilities.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </div>
          {item.period && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent text-light shadow-sm">
                {item.period}
              </span>
            </div>
          )}
          <div className="absolute bottom-4 right-4">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg bg-accent/10 flex items-center justify-center transition-all duration-300 border ${open ? 'border-accent/50' : 'border-accent/25'}`}>
              <FaAngleDown className={`h-4 w-4 md:h-5 md:w-5 text-accent transition-transform duration-300 ${open ? 'rotate-180 -translate-y-0.5' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExperiencesClient = ({ workExperiences, filmExperiences }) => {
  const [activeTab, setActiveTab] = useState('work'); // 'work' | 'films'

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
              {workExperiences.map((experience, index) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  index={index}
                />
              ))}
            </div>
          )}
          {activeTab === 'films' && (
            <div role="tabpanel" aria-labelledby="tab-films" className="space-y-6 lg:space-y-8">
              {filmExperiences.map((item, index) => (
                <FilmExperienceCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ExperiencesClient;
