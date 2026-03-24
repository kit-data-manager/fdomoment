'use client';

import React from 'react';

interface ImportButtonProps {
  label: string;
  loadingLabel?: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ImportButton({
  label,
  loadingLabel = 'Importing...',
  onClick,
  disabled = false,
  size = 'md',
}: ImportButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setHasError(false);

    try {
      await onClick();
    } catch {
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = {
    sm: 'btn-sm',
    md: 'btn-md',
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`btn btn-soft btn-primary ${buttonSize[size]} ${
        isLoading ? 'loading' : ''
      }`}
      style={{
        animation: hasError ? 'shake 0.5s' : 'none',
      }}
    >
      {isLoading ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
