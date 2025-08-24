"use client";

import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { 
  FaVideo, 
  FaPlay, 
  FaImages, 
  FaCode, 
  FaPalette, 
  FaExternalLinkAlt,
  FaExpand,
  FaEye
} from "react-icons/fa";
import LightboxViewer from "@/components/projects/LightboxViewer";
import Modal from "@/components/projects/Modal";
import AnimatedItem from "@/components/ui/AnimatedItem";
import HeroSection from "@/components/ui/HeroSection";
import ProjectCard from "@/components/projects/ProjectCard";

const CreativeImageCard = ({ image, index, onClick }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div 
      ref={ref}
      className={`group relative transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-light/95 to-light/90 dark:from-primary/95 dark:to-primary/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-700 hover:border-accent/40 group-hover:scale-[1.03] cursor-pointer" onClick={onClick}>
        <div className="relative z-10">
          <div className="relative h-64 w-full overflow-hidden">
            <img
              src={image.img}
              alt={image.description}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/90 to-accent/80 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-accent/50">
                  <FaImages className="h-10 w-10 text-light" />
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="px-4 py-2 bg-gradient-to-r from-accent/25 to-accent/20 rounded-xl border border-accent/40 backdrop-blur-sm">
                <span className="text-accent font-semibold text-sm uppercase tracking-wider">
                  Créatif
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl md:text-2xl font-bold text-primary dark:text-light mb-3 group-hover:text-accent transition-colors duration-500">
              {image.description}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent/80 group-hover:text-accent transition-colors duration-300">
                <FaExternalLinkAlt className="h-4 w-4" />
                <span className="text-sm font-medium">Voir l'image</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsClient = ({ videos, playlists, images, content = {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [embedSrc, setEmbedSrc] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default content fallbacks
  const defaultContent = {
    hero: {
      title: "Mes",
      accentWord: "Projets",
      description: "Une collection de projets créatifs et techniques qui démontrent mes compétences en développement, design et création de contenu multimédia."
    },
    sections: {
      videos: {
        title: "Projets",
        accentWord: "Vidéo",
        description: "Découvrez mes créations vidéo et mes compétences en montage et production multimédia."
      },
      playlists: {
        title: "",
        accentWord: "Playlists",
        suffix: "& Collections",
        description: "Explorez mes collections organisées et mes playlists thématiques."
      },
      images: {
        title: "Projets",
        accentWord: "Créatifs",
        description: "Admirez mes créations graphiques et mes compétences en design et retouche d'images."
      }
    }
  };

  // Merge fetched content with defaults
  const pageContent = {
    hero: { ...defaultContent.hero, ...content.hero },
    sections: { ...defaultContent.sections, ...content.sections }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const lightboxSlides = images.map((image) => ({
    img: image.img, // LightboxViewer expects 'img' property
    description: image.description,
  }));
  
  const openModal = (item, type) => {
    let embedUrl = "";
    let title = item.title || item.description;
    
    try {
      const urlObj = new URL(item.url);

      if (type === "video") {
        let videoId = "";
        if (urlObj.hostname.includes("youtu.be")) {
          videoId = urlObj.pathname.replace("/", "");
        } else if (urlObj.pathname.startsWith("/shorts/")) {
          videoId = urlObj.pathname.split("/")[2] || "";
        } else {
          videoId = urlObj.searchParams.get("v") || "";
        }

        if (videoId) {
          const params = new URLSearchParams({ autoplay: "1", rel: "0" });
          embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        }
      } else if (type === "playlist") {
        const playlistId = urlObj.searchParams.get("list") || "";
        if (playlistId) {
          const params = new URLSearchParams({ list: playlistId, autoplay: "1", rel: "0" });
          embedUrl = `https://www.youtube.com/embed/videoseries?${params.toString()}`;
        }
      }
      
      if (embedUrl) {
        setEmbedSrc(embedUrl);
        setModalTitle(title);
        setModalType(type);
        setIsModalOpen(true);
      } else {
      }
    } catch (error) {
      
    }
  };

  const closeModal = () => {
    setEmbedSrc("");
    setModalTitle("");
    setModalType("");
    setIsModalOpen(false);
  };

  return (
    <>
      <HeroSection 
        icons={[FaVideo, FaPalette, FaCode]}
        title={pageContent.hero.title}
        accentWord={pageContent.hero.accentWord}
        description={pageContent.hero.description}
      />

      <section className="py-16 lg:py-24">
        <div className="page-container">
          <AnimatedItem delay={200}>
            <div className="mb-20 lg:mb-24">
              <div className="text-center mb-16 lg:mb-20">
                <div className="inline-flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-accent/25 to-accent/15 rounded-2xl flex items-center justify-center border border-accent/40 shadow-lg">
                    <FaVideo className="h-7 w-7 lg:h-8 lg:w-8 text-accent" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary dark:text-light">
                    {pageContent.sections.videos.title} <span className="text-accent">{pageContent.sections.videos.accentWord}</span>
                  </h2>
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-primary/80 dark:text-light/80 max-w-3xl mx-auto px-4">
                  {pageContent.sections.videos.description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {videos.map((video, index) => (
                  <ProjectCard
                    key={video.id}
                    project={video}
                    type="video"
                    onClick={() => openModal(video, "video")}
                    index={index}
                    content={pageContent.projectCard}
                  />
                ))}
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem delay={400}>
            <div className="mb-20 lg:mb-24">
              <div className="text-center mb-16 lg:mb-20">
                <div className="inline-flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center border border-accent/35 shadow-lg">
                    <FaPlay className="h-7 w-7 lg:h-8 lg:w-8 text-accent/90" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary dark:text-light">
                    <span className="text-accent">{pageContent.sections.playlists.accentWord}</span> {pageContent.sections.playlists.suffix}
                  </h2>
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-primary/80 dark:text-light/80 max-w-3xl mx-auto px-4">
                  {pageContent.sections.playlists.description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {playlists.map((playlist, index) => (
                  <ProjectCard
                    key={playlist.id}
                    project={playlist}
                    type="playlist"
                    onClick={() => openModal(playlist, "playlist")}
                    index={index}
                    content={pageContent.projectCard}
                  />
                ))}
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem delay={600}>
            <div className="mb-20 lg:mb-24">
              <div className="text-center mb-16 lg:mb-20">
                <div className="inline-flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-accent/30 to-accent/20 rounded-2xl flex items-center justify-center border border-accent/45 shadow-lg">
                    <FaImages className="h-7 w-7 lg:h-8 lg:w-8 text-accent/95" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary dark:text-light">
                    {pageContent.sections.images.title} <span className="text-accent">{pageContent.sections.images.accentWord}</span>
                  </h2>
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-primary/80 dark:text-light/80 max-w-3xl mx-auto px-4">
                  {pageContent.sections.images.description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {images.map((image, index) => (
                  <CreativeImageCard
                    key={image.id}
                    image={image}
                    onClick={() => handleImageClick(index)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </AnimatedItem>
        </div>
      </section>

      <Modal
        isModalOpen={isModalOpen}
        embedSrc={embedSrc}
        closeModal={closeModal}
        title={modalTitle}
        type={modalType}
      />
      
      <LightboxViewer
        isOpen={isOpen}
        currentIndex={currentIndex}
        setIsOpen={setIsOpen}
        slides={lightboxSlides}
      />
    </>
  );
};

export default ProjectsClient;
