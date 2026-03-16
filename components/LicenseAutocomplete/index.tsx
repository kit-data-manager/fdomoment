import React from 'react';
import { X } from 'lucide-react';
import { LicenseAutocompleteProps } from './types';
import { useLicenseAutocomplete } from './useLicenseAutocomplete';

const LicenseAutocomplete: React.FC<LicenseAutocompleteProps> = ({ value, onChange, onSelect }) => {
  const { licenses, handleChange, clearSelection } = useLicenseAutocomplete();

  return (
    <div className="w-full flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value, licenses, onSelect)}
        className="select select-ghost flex-1"
      >
        <option value="">Select license...</option>
        {licenses.map((item, index) => (
          <option key={index} value={item.id}>
            {item.name} ({item.id})
          </option>
        ))}
      </select>
      {value && (
        <button
          type="button"
          onClick={() => clearSelection(onChange, onSelect)}
          className="btn btn-ghost btn-sm"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export { LicenseAutocomplete };
