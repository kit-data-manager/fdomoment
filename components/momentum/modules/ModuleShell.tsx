'use client';

import React, { useState } from 'react';

interface ModuleShellProps {
  title: string;
  badge?: 'required' | 'optional';
  onClose?: () => void;
  children: React.ReactNode;
}

export function ModuleShell({
  title,
  badge = 'required',
  onClose,
  children,
}: ModuleShellProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    setShowConfirm(false);
    onClose?.();
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-200">
          <div className="flex items-center gap-3">
            <h2 className="card-title">{title}</h2>
            {badge && (
              <span
                className={`badge badge-sm ${
                  badge === 'required'
                    ? 'badge-error'
                    : 'badge-ghost'
                }`}
              >
                {badge === 'required' ? 'Pflicht' : 'Optional'}
              </span>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          )}
        </div>

        {showConfirm && (
          <div className="alert alert-warning mb-4">
            <span>Remove module? All inputs will be lost.</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-sm btn-error"
              >
                Yes, remove
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
