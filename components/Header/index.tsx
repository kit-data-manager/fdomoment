'use client';

import React, { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { SettingsModal } from '@/components/SettingsModal';
import { useKeycloak } from '@/context/KeycloakContext';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { LogIn, LogOut, FileText, BookMarked } from "lucide-react";

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { keycloak, authenticated, userName } = useKeycloak();
  const pathname = usePathname();

  const handleLogin = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const handleLogout = () => {
    if (keycloak) {
      keycloak.logout({
        redirectUri: window.location.origin,
      });
    }
  };

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
                              {pathname !== '/momentum' && (
                              <span className="text-primary text-bold">FDO MoMEnT - Memento</span>
                                  )}
                              {pathname !== '/memento' && (
                                  <span className="text-primary text-bold">FDO MoMEnT - Momentum</span>
                              )}
                          </div>
                      </h1>
                  </div>

              </div>

          </Link>
        </div>
        
        <div className="flex-none gap-1">
          {pathname !== '/momentum' && (
            <Link
              href="/momentum"
              className="btn btn-ghost btn-sm gap-1"
            >
              <FileText className="w-4 h-4" />
              Momentum
            </Link>
          )}
          {pathname !== '/memento' && (
            <Link
              href="/memento"
              className="btn btn-ghost btn-sm gap-1"
            >
              <BookMarked className="w-4 h-4" />
              Memento
            </Link>
          )}
        </div>

        <div className="flex-none gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.open('https://docs.example.com', '_blank')}
          >
            Help
          </button>
          {authenticated && userName ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-1">
                <span>👤 Logged In</span>
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    Profile Settings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-error"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : keycloak ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-1"
              onClick={handleLogin}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          ) : (
            <span className="loading loading-spinner loading-sm"></span>
          )}
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
