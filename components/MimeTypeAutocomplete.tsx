import React, { useState, useEffect } from 'react';
import { getMimeTypes, searchMimeTypes } from '../utils/mimetype-client';

interface MimeTypeAutocompleteProps {
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  onSelect: (type: string, description: string) => void;
}

const MimeTypeAutocomplete: React.FC<MimeTypeAutocompleteProps> = ({ value, displayValue, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Fetch MIME type suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= 1) {
        try {
          const results = await searchMimeTypes(value);
          if (results && results.length > 0) {
            setSuggestions(results);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching MIME type suggestions:', error);
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
    // Extract MIME type and description from the result
    const mimeType = item.type || '';
    const description = item.description || '';
    onSelect(mimeType, description);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full">
      <input
        value={displayValue || value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        list="mimeTypeSuggestions"
        onInput={(e) => {
          // Find the selected item from suggestions
          const selectedValue = (e.target as HTMLInputElement).value;
          const selectedItem = suggestions.find(item => 
            `${item.description} (${item.type})` === selectedValue ||
            item.type === selectedValue
          );
          if (selectedItem) {
            handleSelect(selectedItem);
          }
        }}
      />
      <datalist id="mimeTypeSuggestions">
        {suggestions.map((item, index) => (
          <option 
            key={index} 
            value={`${item.description} (${item.type})`}
          />
        ))}
      </datalist>
    </div>
  );
};

export default MimeTypeAutocomplete;
