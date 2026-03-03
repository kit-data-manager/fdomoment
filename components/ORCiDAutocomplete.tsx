import React, { useState, useEffect } from 'react';

interface ORCiDAutocompleteProps {
  value: string;
  displayValue: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string) => void;
}

const ORCiDAutocomplete: React.FC<ORCiDAutocompleteProps> = ({ value, displayValue, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Fetch ORCiD suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= 5) {
        try {
          // ORCiD API doesn't have a direct autocomplete endpoint, so we'll use their search API
          const response = await fetch(`https://pub.orcid.org/v3.0/expanded-search/?q=email:${encodeURIComponent(value)}&start=0&rows=50`, {
              headers: {
            "Accept": "application/vnd.orcid+json",
          }});
          const data = await response.json();
          if (data['expanded-result'] && data['expanded-result'].length > 0) {
            setSuggestions(data['expanded-result'] );
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching ORCiD suggestions:', error);
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
    // Extract ORCiD ID and name from the result
    const orcidId = item['orcid-id'] || '';
    const name = `${item['family-names']}, ${item['given-names']}`;
    onSelect(orcidId, name);
    setSuggestions([]);
  };

  return (
    <div className="w-full">
      <input
        value={displayValue || value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
        list="orcidSuggestions"
        onInput={(e) => {
          // Find the selected item from suggestions
          const selectedValue = (e.target as HTMLInputElement).value;
          const selectedItem = suggestions.find(item => 
            `${item['family-names']}, ${item['given-names']} (${item['orcid-id']})` === selectedValue
          );
          if (selectedItem) {
            handleSelect(selectedItem);
          }
        }}
      />
      <datalist id="orcidSuggestions">
        {suggestions.map((item, index) => (
          <option 
            key={index} 
            value={`${item['family-names']}, ${item['given-names']} (${item['orcid-id']})`}
          />
        ))}
      </datalist>
    </div>
  );
};

export default ORCiDAutocomplete;
