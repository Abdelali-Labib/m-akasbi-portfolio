"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme provider for next-themes. Enables consistent theme switching.
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
