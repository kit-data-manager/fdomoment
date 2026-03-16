import React from 'react';
import { X } from 'lucide-react';
import { MimeTypeAutocompleteProps } from '@/components/MimeTypeAutocomplete/types';
import { useMimeTypeAutocomplete } from '@/components/MimeTypeAutocomplete/useMimeTypeAutocomplete';

const MimeTypeAutocomplete: React.FC<MimeTypeAutocompleteProps> = ({ value, onChange, onSelect }) => {
  const { mimeTypes, handleChange, clearSelection } = useMimeTypeAutocomplete();

  return (
    <div className="w-full flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value, mimeTypes, onSelect)}
        className="select select-ghost flex-1"
      >
        <option value="">Select MIME type...</option>
        {mimeTypes.map((item, index) => (
          <option key={index} value={item.type}>
            {item.description} ({item.type})
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

export { MimeTypeAutocomplete };
