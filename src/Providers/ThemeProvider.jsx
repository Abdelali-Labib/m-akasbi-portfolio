"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme provider wrapper for next-themes
 * Provides consistent theme switching across the application
 */
export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
