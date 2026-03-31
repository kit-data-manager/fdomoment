'use client';

import React, { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { SettingsModal } from '@/components/SettingsModal';
import Image from "next/image";
import Link from "next/link";

export function EditorHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm border-b border-base-200 px-6 h-14">
        <div className="flex-1">
          <Link
            href="/"
            target="_self"
            rel="noopener noreferrer"
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
              <div className="flex items-center gap-2 flex-shrink-0">
                  <Image
                      src="/logo_small.png"
                      alt="FDO Moment Logo"
                      width={60}
                      height={60}
                      className="logo w-10 h-10 md:w-12 md:h-12"
                  />
                  <div className="flex justify-center">
                      <h1 className="text-center text-primary">
                          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-1 font-bold">
                            <span className="text-primary text-bold">FDO MoMEnT</span>
                          </div>
                      </h1>
                  </div>

              </div>

          </Link>
        </div>
        <div className="flex-none gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.open('https://docs.example.com', '_blank')}
          >
            Help
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            👤 Profile
          </button>
          <ThemeToggle />

        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
