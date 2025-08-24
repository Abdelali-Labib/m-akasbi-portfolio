"use client";

import Link from "next/link";
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

/**
 * Social media component with configurable links
 * @param {Object} props - Component props
 * @param {Object} props.socialLinks - Social media links from Firestore
 * @param {string} props.containerStyles - Additional container styles
 * @param {string} props.iconStyles - Additional icon styles
 */
const SocialMedia = ({ socialLinks, containerStyles = "", iconStyles = "" }) => {
  // Ensure socialLinks is an object to prevent errors on null/undefined
  const links = socialLinks || {};

  // Default social media configuration with icons and styling
  const socialConfig = [
    {
      name: "Instagram",
      key: "instagram",
      icon: FaInstagram,
      color: "from-pink-500/20 to-purple-600/10",
      hoverColor: "hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600",
      borderColor: "border-pink-500/30 hover:border-pink-500/60",
    },
    {
      name: "Facebook",
      key: "facebook",
      icon: FaFacebookF,
      color: "from-blue-600/20 to-blue-700/10",
      hoverColor: "hover:bg-blue-600",
      borderColor: "border-blue-600/30 hover:border-blue-600/60",
    },
    {
      name: "LinkedIn",
      key: "linkedin",
      icon: FaLinkedinIn,
      color: "from-blue-500/20 to-blue-600/10",
      hoverColor: "hover:bg-blue-500",
      borderColor: "border-blue-500/30 hover:border-blue-500/60",
    },
    {
      name: "YouTube",
      key: "youtube",
      icon: FaYoutube,
      color: "from-red-500/20 to-red-600/10",
      hoverColor: "hover:bg-red-500",
      borderColor: "border-red-500/30 hover:border-red-500/60",
    },
  ];

  // Filter out social links that don't have URLs
  const activeSocialLinks = socialConfig.filter(config => links[config.key]);

  return (
    <div className={`flex items-center justify-center xl:justify-start gap-3 sm:gap-4 md:gap-5 lg:gap-6 ${containerStyles}`}>
      {activeSocialLinks.map((config, index) => {
        const Icon = config.icon;
        const url = links[config.key];
        return (
          <Link
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex items-center justify-center rounded-full border-2 transition-all duration-500 ease-out transform hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/25 active:scale-95 ${config.borderColor} ${iconStyles}
              h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-13 lg:w-13 xl:h-14 xl:w-14
              bg-gradient-to-br ${config.color}
              ${config.hoverColor} hover:text-white
              focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-light dark:focus:ring-offset-primary
            `}
            aria-label={`Visit ${config.name} profile`}
          >
            <Icon className={`transition-all duration-300 group-hover:scale-110 group-hover:rotate-12
              h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 lg:h-5.5 lg:w-5.5 xl:h-6 xl:w-6
              text-primary/80 dark:text-light/80 group-hover:text-white
            `} />
            
            {/* Enhanced hover effects */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-2 border-accent/30 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 ease-out" />
            
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-primary dark:bg-light text-light dark:text-primary text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 pointer-events-none whitespace-nowrap">
              {config.name}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary dark:border-t-light" />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SocialMedia;
