'use client';

import React from 'react';
import { X, Shield, Scale } from 'lucide-react';
import Image from 'next/image';
import {SiGithub} from "@icons-pack/react-simple-icons";
import packageJson from "./../package.json"

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  if (!isOpen) return null;

  const version = packageJson.version;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h2 className="text-xl font-bold">About</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src="/logo_small.png"
              alt="FAIR DO Moment Logo"
              width={80}
              height={80}
              className="mb-4"
            />
            <h3 className="text-2xl font-bold text-primary mb-2">FAIR DO MoMEnT</h3>
            <p className="text-sm text-base-content/70 mb-4">
              A tool for creating highly customizable FAIR Digital Objects with ease in a modular way.
            </p>
            <p className="text-xs text-base-content/50">
              Version {version}
            </p>
            <p className="text-xs text-base-content/50 mt-4">
              © {new Date().getFullYear()} Karlsruhe Institute of Technology (KIT)
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <a
              href="https://github.com/kit-data-manager/fdomoment"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm text-primary hover:text-primary-focus transition-colors font-medium gap-2"
            >
              <SiGithub className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://www.kit.edu/privacypolicy.php"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm text-primary hover:text-primary-focus transition-colors font-medium gap-2"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </a>
            <a
              href="https://www.kit.edu/legals.php"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm text-primary hover:text-primary-focus transition-colors font-medium gap-2"
            >
              <Scale className="w-4 h-4" />
              Legals
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
