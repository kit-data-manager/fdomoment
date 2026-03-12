import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getSPDXLicenses, SPDXLicense } from '@/utils/license-client';

interface LicenseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string, url: string) => void;
}

const LicenseAutocomplete: React.FC<LicenseAutocompleteProps> = ({ value, onChange, onSelect }) => {
  const [licenses, setLicenses] = useState<SPDXLicense[]>([]);

  useEffect(() => {
    getSPDXLicenses().then(setLicenses);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const selectedItem = licenses.find(item => item.id === selectedValue);
      if (selectedItem) {
        onSelect(selectedItem.id, selectedItem.name, selectedItem.url);
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
          onClick={() => {
            onChange('');
            onSelect('', '', '');
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

export default LicenseAutocomplete;
