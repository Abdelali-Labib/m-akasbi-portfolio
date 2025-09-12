"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 sm:p-3 rounded-lg bg-primary/10 dark:bg-light/10 hover:bg-primary/20 dark:hover:bg-light/20 transition-colors border border-primary/20 dark:border-light/20"
      title={`Basculer vers le mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
    >
      {theme === 'dark' ? (
        <FiSun className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-light" />
      ) : (
        <FiMoon className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-light" />
      )}
    </button>
  );
};

export default ThemeToggle;
