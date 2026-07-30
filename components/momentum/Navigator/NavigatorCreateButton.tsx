'use client';

import React, { useState } from 'react';

interface NavigatorCreateButtonProps {
  canCreate: boolean;
  onClick: () => void;
}

export function NavigatorCreateButton({
  canCreate,
  onClick,
}: NavigatorCreateButtonProps) {
  const [justBecameAvailable, setJustBecameAvailable] = useState(false);

  React.useEffect(() => {
    if (canCreate) {
      setJustBecameAvailable(true);
      const timer = setTimeout(() => setJustBecameAvailable(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [canCreate]);

  if (canCreate) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`btn btn-primary w-full ${
          justBecameAvailable ? 'animate-pulse' : ''
        }`}
      >
        Create FAIR DO ✨
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="btn btn-ghost w-full opacity-50"
      title="Core metadata and one of both, data object or software metadata, must be completed."
    >
      Create FAIR DO 🔒
    </button>
  );
}
