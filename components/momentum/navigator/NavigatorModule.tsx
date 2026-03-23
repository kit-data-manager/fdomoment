'use client';

import React from 'react';
import { ModuleStatus } from '@/lib/momentum/types';

interface NavigatorModuleProps {
  module: string;
  status: ModuleStatus;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  isOptional?: boolean;
  onActivate?: () => void;
}

export function NavigatorModule({
  module,
  status,
  label,
  isActive,
  onClick,
  isOptional = false,
  onActivate,
}: NavigatorModuleProps) {
  const icons = {
    pristine: '⚪',
    incomplete: '🟡',
    complete: '🟢',
    locked: '🔒',
  };

  const handleClick = () => {
    if (status === 'locked') return;
    
    if (isOptional && status === 'pristine' && onActivate) {
      onActivate();
    } else if (onClick) {
      onClick();
    }
  };

  const isClickable =
    status !== 'locked' &&
    (onClick || (isOptional && onActivate));

  return (
    <div
      className={`w-full py-2 px-4 text-sm rounded-box cursor-pointer transition-colors mb-1 ${
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : status === 'locked'
          ? 'text-base-content/30 cursor-not-allowed'
          : status === 'pristine'
          ? 'text-base-content/50 hover:text-base-content/70'
          : 'text-base-content hover:bg-base-200'
      }`}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-4 text-center">{icons[status]}</span>
        <span>
          {isOptional && status === 'pristine' ? (
            <span className="text-primary">➕ {label}</span>
          ) : (
            label
          )}
        </span>
      </div>
    </div>
  );
}
