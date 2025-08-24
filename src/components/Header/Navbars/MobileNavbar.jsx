"use client";

import { useState, useEffect, useRef } from "react";
import { links } from "./links";
import DarkModeToggle from "../DarkModeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";
import ThemeProvider from "@/Providers/ThemeProvider";
import { MdMenuOpen } from "react-icons/md";
import { useNavbarVisibility } from "@/Providers/NavbarVisibilityContext";

const MobileNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isNavbarVisible, isScrolled, hasAnimatedIn } = useNavbarVisibility();
  const headerRef = useRef(null);

  // Prevent scrolling when the menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Clean up on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMenuOpen]);

  // Defensive scroll handler to prevent style error
  useEffect(() => {
    const handleScroll = () => {
      // Guard clause to ensure ref is attached
      if (!headerRef.current) return;

      // The logic that might have been causing the error can be placed here,
      // but for now, the guard is the critical fix.
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const closeMenu = () => setIsMenuOpen(false);
  const openMenu = () => setIsMenuOpen(true);

  return (
    <>
      {/* Compact Mobile Header */}
      <header ref={headerRef}
        className={`fixed top-0 z-50 w-full transition-all duration-700 ease-out ${
          isNavbarVisible
            ? "translate-y-0"
            : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-light/95 dark:bg-primary/95 backdrop-blur-xl shadow-lg"
            : "bg-light/80 dark:bg-primary/80 backdrop-blur-md shadow-sm"
        } ${
          hasAnimatedIn ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          {/* Menu Button */}
          <button 
            className="p-2 transition-transform duration-200 hover:scale-105" 
            onClick={openMenu}
            aria-label="Open menu"
          >
            <MdMenuOpen className="h-6 w-6 text-primary dark:text-light" />
          </button>

          {/* Centered Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/accueil" className="text-lg font-bold text-primary dark:text-light group transition-all duration-300 hover:text-accent">
              M<span className="text-accent transition-all duration-300 group-hover:scale-110">.</span>AKASBI
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center">
            <ThemeProvider>
              <DarkModeToggle />
            </ThemeProvider>
          </div>
        </div>
      </header>

      {/* Enhanced Full Screen Menu - Fixed positioning */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-light/95 dark:bg-primary/95 backdrop-blur-xl transition-all duration-300 ease-out">
          
          {/* Header with Close Button */}
          <div className="flex justify-end items-center p-4">
            <button 
              className="p-2 transition-transform duration-200 hover:scale-105" 
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FiX className="h-6 w-6 text-primary dark:text-light" />
            </button>
          </div>

          {/* Centered Menu Content - Using viewport height */}
          <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 pb-8">
            {/* Logo */}
            <div 
              className="mb-12"
              style={{ 
                opacity: 0,
                animation: `fadeInUp 0.5s ease-out 0.1s forwards`
              }}
            >
              <Link href="/accueil" className="text-4xl font-bold text-primary dark:text-light group" onClick={closeMenu}>
                M<span className="text-accent transition-all duration-300 group-hover:scale-110">.</span>AKASBI
              </Link>
            </div>

            {/* Navigation Links with faster animation */}
            <nav className="flex flex-col items-center gap-8 mb-12">
              {links.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={closeMenu}
                  className={`group relative text-xl sm:text-2xl font-bold transition-all duration-300 hover:scale-105 ${
                    link.path === pathname
                      ? "text-accent"
                      : "text-primary dark:text-light hover:text-accent"
                  }`}
                  style={{ 
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${(index + 1) * 0.1}s forwards`
                  }}
                >
                  {link.name}
                  
                  {/* Active Indicator */}
                  {link.path === pathname && (
                    <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-accent rounded-full" />
                  )}
                  
                  {/* Hover Indicator */}
                  <span className="absolute -bottom-2 left-0 h-0.5 w-0 bg-accent rounded-full transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Contact Button */}
            <Link 
              href="/contact" 
              onClick={closeMenu} 
              className="group relative"
              style={{ 
                opacity: 0,
                animation: `fadeInUp 0.5s ease-out ${(links.length + 1) * 0.1}s forwards`
              }}
            >
              <button className={`relative overflow-hidden rounded-full border-2 transition-all duration-500 font-bold text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-light dark:focus:ring-offset-primary ${ 
                pathname === '/contact' 
                  ? 'border-accent/50 bg-light dark:bg-primary text-accent dark:text-accent cursor-default'
                  : 'border-accent bg-gradient-to-r from-accent via-accent/95 to-accent/90 text-light shadow-lg hover:shadow-xl hover:shadow-accent/25 hover:scale-105 hover:-translate-y-0.5'
              } px-8 py-3`}>
                <span className="relative z-10 flex items-center gap-2">
                  Contactez moi
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-light/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full rounded-full" />
              </button>
            </Link>
            
          </div>
        </div>
      )}

      {/* Spacer for content */}
      <div className="h-16"></div>
    </>
  );
};

export default MobileNavbar;
