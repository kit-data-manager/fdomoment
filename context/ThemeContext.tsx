"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Check for user's preferred color scheme on mount
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Apply theme to document body using data-theme attribute
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'business');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'winter');
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};