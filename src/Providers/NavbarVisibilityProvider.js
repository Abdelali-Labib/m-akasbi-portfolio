"use client";

import { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { NavbarVisibilityContext } from './NavbarVisibilityContext';

/**
 * Consolidated navbar visibility provider with Lenis smooth scrolling and initial animation
 */
export const NavbarVisibilityProvider = ({ children }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const lastY = useRef(0);

  // Initial animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimatedIn(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', (e) => {
      const scrollY = e.scroll;
      const direction = scrollY > lastY.current ? 1 : -1;

      // Show navbar when scrolling up or at top, hide when scrolling down
      if (direction === -1 || scrollY < 100) {
        setIsNavbarVisible(true);
      } else {
        setIsNavbarVisible(false);
      }

      setIsScrolled(scrollY > 50);
      lastY.current = scrollY;
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <NavbarVisibilityContext.Provider value={{ isNavbarVisible, isScrolled, hasAnimatedIn }}>
      {children}
    </NavbarVisibilityContext.Provider>
  );
};
