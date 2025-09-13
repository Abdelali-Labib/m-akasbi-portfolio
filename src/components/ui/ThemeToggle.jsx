"use client";

import { BsSun, BsMoonStars } from "react-icons/bs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "", ...props }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [theme, setLocalTheme] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocalTheme(resolvedTheme);
  }, [resolvedTheme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setLocalTheme(newTheme);
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className={`w-12 h-7 bg-gradient-to-r from-accent/30 to-accent/20 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`group relative w-12 h-7 flex items-center rounded-full bg-gradient-to-r from-accent/30 to-accent/20 dark:from-primary/40 dark:to-primary/60 border border-accent/20 dark:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/10 dark:from-primary/30 dark:to-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span
        className={`relative z-10 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-500 ease-out ${
          theme === "light"
            ? "transform translate-x-1 bg-gradient-to-br from-accent to-accent/90 text-light shadow-lg"
            : "transform translate-x-6 bg-gradient-to-br from-primary/80 to-primary/60 text-light shadow-lg"
        }`}
      >
        {theme === "light" ? (
          <BsSun className="h-3 w-3 transition-all duration-300 group-hover:scale-110" />
        ) : (
          <BsMoonStars className="h-3 w-3 transition-all duration-300 group-hover:scale-110" />
        )}
      </span>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}
