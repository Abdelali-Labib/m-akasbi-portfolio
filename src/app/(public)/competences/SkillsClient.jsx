"use client";

import React, { useEffect, useState } from "react";
import { FaTools, FaLightbulb, FaGlobe } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import AnimatedItem from "@/components/ui/AnimatedItem";
import HeroSection from "@/components/ui/HeroSection";
import SkillCard from "@/components/competences/SkillCard";
import CategoryCard from "@/components/competences/CategoryCard";
import { animateSkillPercentages, setupScrollListener, scrollToElement } from "@/utils/skillUtils";

const SkillsClient = ({ sections }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [percentages, setPercentages] = useState([]);
  const [animatedPercentages, setAnimatedPercentages] = useState([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    return setupScrollListener('category-section', setShowScrollButton);
  }, []);

  const scrollToCategories = () => {
    scrollToElement('category-section');
  };

  useEffect(() => {
    if (sections.length > 0 && sections[currentSection]) {
        const targetPercentages = sections[currentSection].data.map(
            (skill) => skill.percentage,
        );
        setPercentages(targetPercentages);

        if (!hasAnimated) {
            setHasAnimated(true);
            setAnimatedPercentages(targetPercentages.map(() => 0));
            animateSkillPercentages(targetPercentages, setAnimatedPercentages);
        } else {
            setAnimatedPercentages(targetPercentages);
        }
    }
  }, [currentSection, hasAnimated, sections]);

  if (!sections || sections.length === 0) {
    return <div>Loading skills or no skills to display...</div>;
  }

  return (
    <>
      <HeroSection 
        icons={[FaTools, FaLightbulb, FaGlobe]}
        title="Mes"
        accentWord="Compétences"
        description="Découvrez mon expertise dans les outils de création, les techniques audiovisuelles et les langues, développée au fil de mes expériences professionnelles."
      />

      <section className="py-16 lg:py-24">
        <div className="page-container">
          <div id="category-section">
            <AnimatedItem delay={200}>
              <div className="text-center mb-16 lg:mb-20">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary dark:text-light mb-6 lg:mb-8">
                  Choisissez une <span className="text-accent">Catégorie</span>
                </h2>
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-primary/80 dark:text-light/80 max-w-3xl lg:max-w-4xl mx-auto mb-12 lg:mb-16 px-4">
                  Explorez mes compétences par domaine d'expertise
                </p>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={400}>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20 lg:mb-24">
                {sections.map((section, index) => (
                  <CategoryCard
                    key={index}
                    section={section}
                    index={index}
                    isActive={currentSection === index}
                    onClick={() => setCurrentSection(index)}
                  />
                ))}
              </div>
            </AnimatedItem>
          </div>

          <AnimatedItem delay={600}>
            <div className="w-full">
              <div className="text-center mb-16 lg:mb-24">
                <div className="mb-6 lg:mb-8 flex justify-center">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-accent/25 to-accent/15 rounded-3xl flex items-center justify-center border border-accent/40 shadow-xl">
                    {currentSection === 0 && <FaTools className="h-10 w-10 lg:h-12 lg:w-12 text-accent" />}
                    {currentSection === 1 && <FaLightbulb className="h-10 w-10 lg:h-12 lg:w-12 text-accent" />}
                    {currentSection === 2 && <FaGlobe className="h-10 w-10 lg:h-12 lg:w-12 text-accent" />}
                  </div>
                </div>
                <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary dark:text-light mb-6 lg:mb-8">
                  {sections[currentSection].name}
                </h3>
                <div className="w-32 sm:w-40 lg:w-48 h-1.5 lg:h-2 bg-gradient-to-r from-accent/30 via-accent to-accent/30 rounded-full mx-auto" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:grid-cols-3 sm:gap-6 lg:gap-8 xl:gap-10 items-stretch">
                {sections[currentSection].data.length > 0 ? (
                  sections[currentSection].data.map((skill, index) => (
                    <SkillCard
                      key={index}
                      skill={skill}
                      index={index}
                      animatedPercentage={animatedPercentages[index]}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg text-primary/70 dark:text-light/70">
                      Aucune compétence à afficher dans cette catégorie pour le moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </AnimatedItem>
        </div>
      </section>

      {showScrollButton && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={scrollToCategories}
            className="group relative px-6 py-4 bg-gradient-to-br from-accent to-accent/90 text-light rounded-2xl shadow-2xl shadow-accent/30 border-2 border-accent/60 hover:scale-110 transition-all duration-300 hover:shadow-3xl backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex items-center gap-3">
              <FaTools className="h-5 w-5" />
              <span className="font-semibold text-sm sm:text-base">Catégories</span>
              <IoIosArrowForward className="h-4 w-4 rotate-[-90deg]" />
            </div>
            
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-accent/60 to-accent/40 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      )}
    </>
  );
};

export default SkillsClient;
