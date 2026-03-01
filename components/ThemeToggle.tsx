"use client";

import React from 'react';
import { Icon } from '@iconify/react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme();
  
  return (
    <button 
      className="btn btn-secondary btn-ghost btn-sm"
      onClick={toggleTheme}
    >
      {darkMode ? <Icon icon="mdi:white-balance-sunny" width="20" height="20" /> : <Icon icon="mdi:moon-waning-crescent" width="20" height="20" />}
    </button>
  );
};

export default ThemeToggle;