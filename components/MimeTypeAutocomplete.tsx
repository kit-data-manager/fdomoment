import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getMimeTypes, MimeType } from '../utils/mimetype-client';

interface MimeTypeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (type: string, description: string) => void;
}

const MimeTypeAutocomplete: React.FC<MimeTypeAutocompleteProps> = ({ value, onChange, onSelect }) => {
  const [mimeTypes, setMimeTypes] = useState<MimeType[]>([]);

  useEffect(() => {
    getMimeTypes().then(setMimeTypes);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const selectedItem = mimeTypes.find(item => item.type === selectedValue);
      if (selectedItem) {
        onSelect(selectedItem.type, selectedItem.description);
      }
    }
  };

  return (
    <div className="w-full flex items-center gap-2">
      <select
        value={value}
        onChange={handleChange}
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
          onClick={() => {
            onChange('');
            onSelect('', '');
          }}
          className="btn btn-ghost btn-sm"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MimeTypeAutocomplete;
