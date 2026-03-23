'use client';

import React, { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { SettingsModal } from '@/components/SettingsModal';

export function EditorHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm border-b border-base-200 px-6 h-14">
        <div className="flex-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            🔬 FDO Creator
          </a>
        </div>
        <div className="flex-none gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.open('https://docs.example.com', '_blank')}
          >
            Hilfe
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            👤 Profile
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
