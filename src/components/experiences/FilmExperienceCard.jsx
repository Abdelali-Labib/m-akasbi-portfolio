"use client";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { FaAngleDown } from "react-icons/fa";
import { HiOutlineOfficeBuilding, HiOutlineLocationMarker } from 'react-icons/hi';

const FilmExperienceCard = ({ experience, index }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [open, setOpen] = useState(false);
  
  const isCurrent = experience.current === true;

  return (
    <div 
      ref={ref}
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 200}ms` }}
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
        className={`relative overflow-hidden rounded-2xl border ${isCurrent ? 'border-accent/60' : 'border-accent/20'} bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 shadow-lg transition-all duration-500 hover:border-accent/40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`}
      >
        <div className="p-4 sm:p-6 pb-14 pr-14 relative z-10">
          <div className="absolute top-4 right-4 z-20">
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-accent text-light shadow-sm">
              {experience.startYear}{experience.endYear && ` - ${experience.endYear}`}
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

                {experience.filmName && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/10 text-accent border border-accent/20">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
                      </svg>
                      {experience.filmName}
                    </span>
                  </div>
                )}

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
                </div>
              </div>
            </div>
          </div>

          <div
            id={`film-${index}-content`}
            className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="pt-4 border-t border-accent/20">
              {experience.achievements && experience.achievements.length > 0 && (
                <div>
                  <h4 className="text-primary dark:text-light font-semibold mb-3 text-sm md:text-base">
                    Réalisations clés :
                  </h4>
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

        <div className="absolute bottom-4 right-4">
          <div className={`p-2 rounded-full bg-accent/10 border border-accent/20 transition-all duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}>
            <FaAngleDown className="h-4 w-4 text-accent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmExperienceCard;
