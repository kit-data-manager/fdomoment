'use client';

import React from 'react';

interface ModuleShellProps {
  title: string;
  badge?: 'required' | 'optional';
  onClose?: () => void;
  children: React.ReactNode;
}

export function ModuleShell({
  title,
  badge = 'required',
  children,
}: ModuleShellProps) {

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200">
          <div className="flex items-center gap-3">
            <h2 className="card-title">{title}</h2>
            {badge && badge === 'optional' && (
              <span
                className={`badge badge-sm badge-primary`}
              >
                Optional
              </span>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
