import React, { useState, useEffect } from 'react';

interface RORAutocompleteProps {
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string) => void;
}

const RORAutocomplete: React.FC<RORAutocompleteProps> = ({ value, displayValue, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Fetch ROR suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if ( value.length >= 5) {
        try {
          const response = await fetch(`https://api.ror.org/organizations?query=${encodeURIComponent(value)}`);
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            setSuggestions(data.items);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching ROR suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    
    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [value]);

  const handleSelect = (item: any) => {
    onSelect(item.id, item.names[0].value);
    setSuggestions([]);
  };

  return (
    <div className="w-full">
      <input
        value={displayValue || value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        list="rorSuggestions"
        onInput={(e) => {
          // Find the selected item from suggestions
          const selectedValue = (e.target as HTMLInputElement).value;
          const selectedItem = suggestions.find(item => 
            `${item.names.find((name: any) => name.types && name.types.includes('ror_display'))?.value || item.names[0].value} (${item.id})` === selectedValue
          );
          if (selectedItem) {
            handleSelect(selectedItem);
          }
        }}
      />
      <datalist id="rorSuggestions">
        {suggestions.map((item, index) => (
          <option 
            key={index} 
            value={`${item.names.find((name: any) => name.types && name.types.includes('ror_display'))?.value || item.names[0].value} (${item.id})`}
          />
        ))}
      </datalist>
    </div>
  );
};

export default RORAutocomplete;
