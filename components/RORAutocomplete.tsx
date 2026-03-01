import React, { useState, useEffect } from 'react';

interface RORAutocompleteProps {
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string) => void;
}

const RORAutocomplete: React.FC<RORAutocompleteProps> = ({ value, displayValue, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch ROR suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      console.log("Fetching Suggestions", value);
      if ( value.length >= 5) {
        try {
          const response = await fetch(`https://api.ror.org/organizations?query=${encodeURIComponent(value)}`);
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            setSuggestions(data.items);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching ROR suggestions:', error);
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
    onSelect(item.id, item.names[0].value);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full">
      <input
        value={displayValue || value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        onFocus={() => value.length >= 5 && setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 1 && (
        <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {item.names[0].value} ({item.id})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RORAutocomplete;