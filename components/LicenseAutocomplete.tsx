import React, { useState, useEffect } from 'react';
import { searchSPDXLicenses } from '../utils/license-client';

interface LicenseAutocompleteProps {
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string, url: string) => void;
}

const LicenseAutocomplete: React.FC<LicenseAutocompleteProps> = ({ value, displayValue, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Fetch license suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= 1) {
        try {
          const results = await searchSPDXLicenses(value);
          if (results && results.length > 0) {
            setSuggestions(results);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching license suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    
    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [value]);

    const handleSelect = (item: any) => {
        // Extract license ID, name, and URL from the result
        const licenseId = item.id || '';
        const licenseName = item.name || '';
        const licenseUrl = item.url || '';
        onSelect(licenseId, licenseName, licenseUrl);
        setSuggestions([]);
        setShowSuggestions(false);
    };

  return (
    <div className="w-full">
      <input
        value={displayValue || value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        list="licenseSuggestions"
        onInput={(e) => {
          // Find the selected item from suggestions
          const selectedValue = (e.target as HTMLInputElement).value;
          const selectedItem = suggestions.find(item => 
            `${item.name} (${item.id})` === selectedValue ||
            item.id === selectedValue
          );
          if (selectedItem) {
            handleSelect(selectedItem);
          }
        }}
      />
      <datalist id="licenseSuggestions">
        {suggestions.map((item, index) => (
          <option 
            key={index} 
            value={`${item.name} (${item.id})`}
          />
        ))}
      </datalist>
    </div>
  );
};

export default LicenseAutocomplete;
