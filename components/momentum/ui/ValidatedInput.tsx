'use client';

import React from 'react';

interface ValidatedInputProps {
  label: string;
  required?: boolean;
  type?: 'text' | 'url' | 'email';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  validationState?: 'none' | 'pending' | 'valid' | 'invalid';
  validationMessage?: string;
  importedBadge?: boolean;
}

export function ValidatedInput({
  label,
  required = false,
  type = 'text',
  value,
  onChange,
  placeholder,
  hint,
  validationState = 'none',
  validationMessage,
  importedBadge = false,
}: ValidatedInputProps) {
  const inputClasses = {
    none: 'input-bordered',
    pending: 'input-warning',
    valid: 'input-success',
    invalid: 'input-error',
  };

  const icons = {
    none: null,
    pending: (
      <span className="loading loading-spinner loading-xs text-warning"></span>
    ),
    valid: <span className="text-success text-lg">✓</span>,
    invalid: <span className="text-error text-lg">✕</span>,
  };

  const messageColors = {
    valid: 'text-success',
    invalid: 'text-error',
    pending: 'text-warning',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
            {importedBadge && (
              <span className="badge badge-sm badge-info ml-2">
                📥 Importiert
              </span>
            )}
          </span>
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input w-full ${inputClasses[validationState]}`}
        />
        {validationState !== 'none' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {icons[validationState]}
          </div>
        )}
      </div>
      {validationMessage && validationState !== 'none' && (
        <label className="label">
          <span className={`label-text-alt ${messageColors[validationState]}`}>
            {validationMessage}
          </span>
        </label>
      )}
      {!validationMessage && hint && validationState === 'none' && (
        <label className="label">
          <span className="label-text-alt text-base-content/70">{hint}</span>
        </label>
      )}
    </div>
  );
}
