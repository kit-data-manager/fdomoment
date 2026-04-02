'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function AppSelector() {
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const router = useRouter();

  return (
      <div className="flex items-center justify-center gap-6 py-8">
        <div
            className={`card bg-base-100 shadow-md w-48 cursor-pointer border-2 transition-all hover:shadow-lg ${side === 'left' ? 'border-primary scale-105' : 'border-transparent'}`}
            onMouseEnter={() => setSide('left')}
            onMouseLeave={() => setSide(null)}
            onClick={() => router.push('/momentum')}
        >
          <div className="card-body p-4">
            <h3 className="card-title text-sm text-primary">Momentum</h3>
            <p className="text-xs text-base-content/60">
              Create and customize your FAIR Digital Objects step by step with minimum effort.
            </p>
            <div className={`flex items-center gap-1 text-xs text-primary mt-1 transition-opacity ${side === 'left' ? 'opacity-100' : 'opacity-0'}`}>
              <span>Open Momentum</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 w-32 h-32 relative">
          <Image
            src="/puzzle_complete.png"
            alt="FDO MoMEnT"
            width={128}
            height={128}
            className={`logo absolute inset-0 transition-opacity duration-200 ${side === null ? 'opacity-100' : 'opacity-0'}`}
          />
          <Image
            src="/down_left.png"
            alt="Momentum"
            width={128}
            height={128}
            className={`logo absolute inset-0 transition-opacity duration-200 ${side === 'left' ? 'opacity-100' : 'opacity-0'}`}
          />
          <Image
            src="/up_right.png"
            alt="Memento"
            width={128}
            height={128}
            className={`logo absolute inset-0 transition-opacity duration-200 ${side === 'right' ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        <div
            className={`card bg-base-100 shadow-md w-48 cursor-pointer border-2 transition-all hover:shadow-lg ${side === 'right' ? 'border-secondary scale-105' : 'border-transparent'}`}
            onMouseEnter={() => setSide('right')}
            onMouseLeave={() => setSide(null)}
            onClick={() => router.push('/memento')}
        >
          <div className="card-body p-4">
            <h3 className="card-title text-sm text-secondary">Memento</h3>
            <p className="text-xs text-base-content/60">
              Review your created FDOs, track FAIR scores, and view statistics.
            </p>
            <div className={`flex items-center gap-1 text-xs text-secondary mt-1 transition-opacity ${side === 'right' ? 'opacity-100' : 'opacity-0'}`}>
              <span>Open Memento</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
  );
}
