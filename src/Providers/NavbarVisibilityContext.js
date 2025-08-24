"use client";

import { createContext, useContext } from 'react';

export const NavbarVisibilityContext = createContext({
  isNavbarVisible: true,
  isScrolled: false,
  hasAnimatedIn: false,
});

/**
 * Hook to use navbar visibility context
 */
export const useNavbarVisibility = () => {
  const context = useContext(NavbarVisibilityContext);
  if (!context) {
    throw new Error('useNavbarVisibility must be used within NavbarVisibilityProvider');
  }
  return context;
};
