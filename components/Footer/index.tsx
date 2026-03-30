'use client';

import { useKeycloak } from '@/context/KeycloakContext';
import { LogIn, LogOut, Copyright } from 'lucide-react';
import { SiGithub } from '@icons-pack/react-simple-icons';


export function Footer() {
  const { authenticated, login, logout, userName } = useKeycloak();

  return (
    <footer className="py-4 px-6 border-t bg-base-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-base-content/80">
          {/* Login Status */}
          <div className="flex items-center gap-2">
            {authenticated && userName ? (
              <>
                <LogOut className="w-4 h-4" />
                <span>Logged in as <strong>{userName}</strong></span>
                <button 
                  onClick={logout}
                  className="text-error hover:underline"
                  title="Logout"
                >
                  (Logout)
                </button>
              </>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 hover:underline"
              >
                <LogIn className="w-4 h-4" />
                <span>Login with Keycloak</span>
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="hidden md:block w-px h-4 bg-base-content/20"></div>

          {/* GitHub Link */}
          <a
            href="https://github.com/kit-data-manager/fdomoment"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <SiGithub className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>

          {/* Separator */}
          <div className="hidden md:block w-px h-4 bg-base-content/20"></div>

          {/* Copyright */}
          <div className="flex items-center gap-2">
            <Copyright className="w-4 h-4" />
            <span>{new Date().getFullYear()} Karlsruhe Institute of Technology (KIT)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
