import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
});

// Theme configuration
const THEME = {
  primary: '#FF9932',
  background: {
    main: 'rgba(0, 0, 0, 0.9)',
    panel: 'rgba(0, 0, 0, 0.9)',
    button: 'rgba(0, 0, 0, 0.6)',
    thumbnail: 'rgba(0, 0, 0, 0.5)',
    thumbnailActive: 'rgba(255, 153, 50, 0.2)',
  },
  blur: 'blur(10px)',
  border: {
    default: '1px solid rgba(255, 255, 255, 0.1)',
    primary: '2px solid #FF9932',
    button: '2px solid rgba(255, 153, 50, 0.5)',
  }
};

// Lightbox styles configuration - clean without media queries
const lightboxStyles = {
  container: { 
    backgroundColor: THEME.background.main,
    backdropFilter: THEME.blur,
    '--yarl__color_button': THEME.primary,
    '--yarl__color_button_hover': THEME.primary,
    '--yarl__color_button_active': THEME.primary,
  },
  thumbnailsContainer: {
    backgroundColor: THEME.background.panel,
    padding: '12px 0',
  },
  thumbnailsTrack: {
    padding: '0 20px',
  },
  button: {
    backgroundColor: THEME.background.button,
    border: THEME.border.button,
    borderRadius: "50%",
    padding: "12px",
    color: THEME.primary,
    transition: "all 0.3s ease",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },
  buttonHover: {
    backgroundColor: THEME.background.thumbnailActive,
    border: "2px solid rgba(255, 153, 50, 0.8)",
    transform: "scale(1.1)",
    boxShadow: "0 6px 20px rgba(255, 153, 50, 0.3)",
  },
  thumbnail: {
    border: THEME.border.default,
    borderRadius: "8px",
    transition: "all 0.3s ease",
    opacity: 0.8,
    backgroundColor: THEME.background.thumbnail,
  },
  thumbnailActive: {
    border: THEME.border.primary,
    transform: "scale(1.05)",
    opacity: 1,
    backgroundColor: THEME.background.thumbnailActive,
    boxShadow: "0 4px 12px rgba(255, 153, 50, 0.3)",
  },
  counter: {
    backgroundColor: THEME.background.thumbnailActive,
    color: THEME.primary,
    borderRadius: "20px",
    padding: "8px 16px",
    fontSize: "0.875rem",
    fontWeight: "600",
    border: "1px solid rgba(255, 153, 50, 0.3)",
    backdropFilter: "blur(8px)",
  },
};


// Navigation icons
const NavigationIcons = {
  Next: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
    </svg>
  ),
  Prev: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6l-6 6 6 6 1.41-1.41z"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"/>
    </svg>
  ),
  Fullscreen: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  ),
  Slideshow: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
};

const LightboxViewer = ({ isOpen, currentIndex, setIsOpen, slides }) => {
  const [screenSize, setScreenSize] = useState({ width: 1024, height: 768 });

  // Screen size tracking for responsive thumbnails
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    if (typeof window !== 'undefined') {
      updateScreenSize();
      window.addEventListener('resize', updateScreenSize);
      return () => window.removeEventListener('resize', updateScreenSize);
    }
  }, []);

  // Body scroll management
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Prepare slides data
  const lightboxSlides = slides.map(slide => ({
    src: slide.img,
    alt: slide.description || "Project image",
  }));

  // Configure plugins
  const plugins = [
    Counter,
    Zoom,
    Thumbnails,
    Fullscreen,
    Slideshow
  ];

  // Lightbox configuration
  const lightboxConfig = {
    open: isOpen,
    index: currentIndex,
    close: () => setIsOpen(false),
    slides: lightboxSlides,
    plugins,
    
    // Zoom configuration
    zoom: {
      scrollToZoom: true,
      maxZoomPixelRatio: 3,
      zoomInMultiplier: 1.6,
      doubleTapDelay: 300,
      doubleClickDelay: 300,
      doubleClickMaxStops: 2,
      keyboardMoveDistance: 50,
      pinch: true,
      wheel: true,
    },
    
    
    // Thumbnails configuration - responsive
    thumbnails: {
      width: screenSize.width < 640 ? 80 : screenSize.width < 768 ? 100 : 120,
      height: screenSize.width < 640 ? 60 : screenSize.width < 768 ? 75 : 80,
      padding: screenSize.width < 640 ? 2 : 4,
      border: 2,
      borderRadius: screenSize.width < 640 ? 6 : 8,
      gap: screenSize.width < 640 ? 8 : screenSize.width < 768 ? 12 : 16,
      imageFit: "cover",
    },
    
    // Slideshow configuration
    slideshow: {
      autoplay: false,
      delay: 3000,
      interval: 3000,
      pauseOnHover: true,
      pauseOnFocus: true,
    },
    
    // Custom rendering - hide prev/next on mobile
    render: {
      buttonPrev: slides.length <= 1 || screenSize.width < 640 ? () => null : undefined,
      buttonNext: slides.length <= 1 || screenSize.width < 640 ? () => null : undefined,
      iconNext: NavigationIcons.Next,
      iconPrev: NavigationIcons.Prev,
      iconClose: NavigationIcons.Close,
      iconFullscreen: NavigationIcons.Fullscreen,
      iconSlideshow: NavigationIcons.Slideshow,
    },
    
    styles: lightboxStyles,
    
    on: {
      view: ({ index }) => {},
      close: () => {},
    }
  };


  if (!isOpen) return null;

  return (
    <>
      <Lightbox {...lightboxConfig} />


      {/* Global styles - responsive */}
      <style jsx global>{`
        /* Ensure thumbnails container has proper z-index */
        .yarl__thumbnails_container {
          z-index: 9999 !important;
        }

        /* Counter styling - responsive */
        .yarl__counter {
          background-color: ${THEME.background.thumbnailActive} !important;
          color: ${THEME.primary} !important;
          border: 1px solid rgba(255, 153, 50, 0.3) !important;
          border-radius: 16px !important;
          padding: 6px 12px !important;
          font-size: 0.75rem !important;
          backdrop-filter: blur(8px);
        }

        @media (min-width: 640px) {
          .yarl__counter {
            border-radius: 20px !important;
            padding: 8px 16px !important;
            font-size: 0.875rem !important;
          }
        }

        /* Responsive lightbox container */
        .yarl__container {
          padding: 8px !important;
        }

        @media (min-width: 640px) {
          .yarl__container {
            padding: 16px !important;
          }
        }

        /* Responsive navigation buttons */
        .yarl__button {
          width: 40px !important;
          height: 40px !important;
          padding: 8px !important;
        }

        @media (min-width: 640px) {
          .yarl__button {
            width: 48px !important;
            height: 48px !important;
            padding: 12px !important;
          }
        }

        /* Responsive thumbnails */
        .yarl__thumbnail {
          border-radius: 6px !important;
        }

        @media (min-width: 640px) {
          .yarl__thumbnail {
            border-radius: 8px !important;
          }
        }

        /* Responsive thumbnails container and track */
        @media (max-width: 639px) {
          .yarl__thumbnails_container {
            padding: 8px 0 !important;
          }
          
          .yarl__thumbnails_track {
            padding: 0 8px !important;
          }
        }

        @media (min-width: 640px) {
          .yarl__thumbnails_container {
            padding: 12px 0 !important;
          }
          
          .yarl__thumbnails_track {
            padding: 0 20px !important;
          }
        }
      `}</style>
    </>
  );
};

export default LightboxViewer;
