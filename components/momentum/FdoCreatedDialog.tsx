'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, RotateCcw, ExternalLink } from 'lucide-react';

interface FdoCreatedDialogProps {
  isOpen: boolean;
  pid: string;
  onStartOver: () => void;
}

export function FdoCreatedDialog({ isOpen, pid, onStartOver }: FdoCreatedDialogProps) {
  const router = useRouter();
  const [showCheck, setShowCheck] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowCheck(false);
      setShowContent(false);
      const checkTimer = setTimeout(() => setShowCheck(true), 200);
      const contentTimer = setTimeout(() => setShowContent(true), 800);
      return () => {
        clearTimeout(checkTimer);
        clearTimeout(contentTimer);
      };
    }
  }, [isOpen]);

  const handleViewInMemento = () => {
    router.push(`/memento?view=fdos&pid=${encodeURIComponent(pid)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative bg-base-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-8 flex flex-col items-center">
          <div className={`transition-all duration-500 ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-success" strokeWidth={1.5} />
              <Sparkles className={`w-6 h-6 text-warning absolute -top-1 -right-1 transition-all duration-300 ${showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} style={{ transitionDelay: '400ms' }} />
              <Sparkles className={`w-4 h-4 text-warning absolute -bottom-1 -left-2 transition-all duration-300 ${showCheck ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} style={{ transitionDelay: '600ms' }} />
            </div>
          </div>

          <div className={`mt-4 text-center transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-bold text-base-content">FDO Created</h2>
            <p className="text-base-content/60 mt-2">
              Your FAIR Digital Object has been successfully created.
            </p>
          </div>
        </div>

        <div className={`p-6 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
          <div className="bg-base-200 rounded-lg p-3 mb-6">
            <span className="text-xs text-base-content/50 block mb-1">PID</span>
            <code className="text-sm font-mono break-all">{pid}</code>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="btn btn-primary w-full gap-2"
              onClick={handleViewInMemento}
            >
              <ExternalLink className="w-4 h-4" />
              View in Memento
            </button>
            <button
              className="btn btn-ghost w-full gap-2"
              onClick={onStartOver}
            >
              <RotateCcw className="w-4 h-4" />
              Create Another FAIR DO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
