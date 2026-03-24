'use client';

import React, { useEffect, useState } from 'react';
import { EditorHeader } from '@/components/momentum/EditorHeader';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load and apply theme on mount
    const stored = localStorage.getItem('fdmoment-user-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const theme = parsed.theme || 'system';
        
        const root = document.documentElement;
        if (theme === 'system') {
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.setAttribute('data-theme', systemDark ? 'business' : 'silk');
        } else {
          root.setAttribute('data-theme', theme === 'dark' ? 'business' : 'silk');
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    } else {
      // Default to system theme
      const root = document.documentElement;
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemDark ? 'business' : 'silk');
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorHeader />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
