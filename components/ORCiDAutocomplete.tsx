import React, { useState, useEffect } from 'react';

interface ORCiDAutocompleteProps {
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string) => void;
}

const ORCiDAutocomplete: React.FC<ORCiDAutocompleteProps> = ({ value, displayValue, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Fetch ORCiD suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= 5) {
        try {
          // ORCiD API doesn't have a direct autocomplete endpoint, so we'll use their search API
          const response = await fetch(`https://pub.orcid.org/v3.0/expanded-search/?q=email:${encodeURIComponent(value)}&start=0&rows=10`, {
              headers: {
            "Accept": "application/vnd.orcid+json",
          }});
          const data = await response.json();
          if (data['expanded-result'] && data['expanded-result'].length > 0) {
            setSuggestions(data['expanded-result'] );
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Error fetching ORCiD suggestions:', error);
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
    // Extract ORCiD ID and name from the result
    const orcidId = item['orcid-id'] || '';
    const name = `${item['family-names']}, ${item['given-names']}`;
    
    onSelect(orcidId, name);
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
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          {suggestions.map((item, index) => { console.log("ITEM", item);return (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {item['family-names']}, {item['given-names']} ({item['orcid-id']})
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default ORCiDAutocomplete;