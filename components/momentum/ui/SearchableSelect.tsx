'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  label: string;
  hint?: string;
  category?: string;
}

interface SearchableSelectProps {
  label: string;
  required?: boolean;
  options: Option[];
  value: string | null;
  onChange: (option: Option) => void;
  placeholder?: string;
  hint?: string;
  quickOptions?: Option[];
  importedBadge?: boolean;
}

export function SearchableSelect({
  label,
  required = false,
  options,
  value,
  onChange,
  placeholder = 'Please select...',
  hint,
  quickOptions,
  importedBadge = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.hint?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleQuickSelect = (option: Option) => {
    onChange(option);
  };
  return (
    <div className="w-full relative" ref={containerRef}>
      <label className="label">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
          {importedBadge && (
              <div className="indicator ml-5">
                  <span className="indicator-item badge badge-primary badge-xs">Imported</span>
                  <div>&nbsp;</div>
              </div>
          )}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : selectedOption?.label || ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={!isOpen}
          className="input input-bordered w-full cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-200 rounded-box shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-base-content/70">No option found</div>
          ) : (
            filteredOptions.map(option => (
              <div
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`p-3 cursor-pointer hover:bg-base-200 transition-colors ${
                  option.id === value ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <div className="text-sm">{option.label}</div>
                {option.hint && (
                  <div className="text-xs text-base-content/70 mt-0.5" dangerouslySetInnerHTML={{ __html: option.hint }} />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {quickOptions && quickOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {quickOptions.map(option => (
            <div
              key={option.id}
              onClick={() => handleQuickSelect(option)}
              className="badge badge-soft badge-primary hover:bg-primary hover:text-primary-content transition-colors cursor-pointer"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {hint && !selectedOption && (
        <label className="label">
          <span className="label-text-alt text-base-content/70">{hint}</span>
        </label>
      )}
    </div>
  );
}
