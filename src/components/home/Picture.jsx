"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { FiUser } from "react-icons/fi";

function Picture({ profileInfo = {} }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Use profile picture URL from props, fallback to environment variable if not provided
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const profilePictureUrl = profileInfo.profilePictureUrl || `https://res.cloudinary.com/${cloudName}/image/upload/picture.png`;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className="group relative h-[280px] w-[280px] sm:h-[320px] sm:w-[320px] md:h-[380px] md:w-[380px] lg:h-[420px] lg:w-[420px] xl:h-[480px] xl:w-[480px] animate-fade-in" style={{ perspective: '1000px' }}>
      {/* Main Container with sophisticated styling */}
      <div className="relative h-full w-full transition-all duration-700 ease-out group-hover:transform-[rotateY(5deg)_rotateX(2deg)] group-hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
        {/* Background gradient container */}
        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-1 backdrop-blur-sm sm:rounded-[2rem] shadow-2xl">
          <div className="h-full w-full rounded-[1.4rem] bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-md dark:from-primary/95 dark:to-primary/80 sm:rounded-[1.9rem]">
            {/* Image container */}
            <div className="relative h-full w-full overflow-hidden rounded-[1.3rem] p-3 sm:rounded-[1.8rem] sm:p-4">
              {imageError ? (
                <div className="flex h-full w-full items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  <div className="text-center">
                    <FiUser className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Image non disponible</p>
                  </div>
                </div>
              ) : (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <Image
                    src={profilePictureUrl}
                    priority
                    quality={95}
                    fill
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 380px, (max-width: 1280px) 420px, 480px"
                    alt="Mouhcine Akasbi's Picture"
                    className="rounded-[1rem] sm:rounded-[1.5rem] object-cover shadow-inner transition-all duration-500 group-hover:scale-105"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced animated border */}
        <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem]">
          <svg
            className="h-full w-full rotate-animation"
            fill="transparent"
            viewBox="0 0 480 480"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9932" stopOpacity="0.8" />
                <stop offset="25%" stopColor="#FF9932" stopOpacity="1" />
                <stop offset="50%" stopColor="#FF9932" stopOpacity="0.6" />
                <stop offset="75%" stopColor="#FF9932" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF9932" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect
              x="8"
              y="8"
              width="464"
              height="464"
              rx="24"
              stroke="url(#borderGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dash-animation"
              filter="url(#glow)"
            />
          </svg>
        </div>

        {/* Enhanced floating decorative elements */}
        <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 animate-float sm:-top-6 sm:-right-6 sm:h-12 sm:w-12 shadow-lg"></div>
        <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-gradient-to-br from-accent/50 to-accent/30 animate-float-delayed sm:-bottom-6 sm:-left-6 sm:h-8 sm:w-8 shadow-lg"></div>
        <div className="absolute top-1/2 -right-4 h-4 w-4 rounded-full bg-gradient-to-br from-accent/30 to-accent/15 animate-float-slow sm:-right-8 sm:h-6 sm:w-6 shadow-md"></div>
        <div className="absolute top-1/4 -left-2 h-3 w-3 rounded-full bg-gradient-to-br from-accent/40 to-accent/25 animate-float-fast sm:-left-4 sm:h-4 sm:w-4 shadow-md"></div>

        {/* Enhanced corner accents */}
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent/80 animate-ping sm:-top-2 sm:-right-2 sm:h-6 sm:w-6"></div>
        <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-accent/90 animate-ping-delayed sm:-bottom-2 sm:-left-2 sm:h-4 sm:w-4"></div>

        {/* Enhanced shadow effect */}
        <div className="absolute -bottom-2 left-1/2 h-4 w-3/4 -translate-x-1/2 rounded-full bg-black/20 blur-lg sm:-bottom-4 sm:h-8 group-hover:bg-black/30 transition-all duration-700"></div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Picture), { ssr: false });