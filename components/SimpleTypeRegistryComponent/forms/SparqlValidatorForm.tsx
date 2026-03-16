import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface ValidatorArgument {
  key: string;
  value: string;
}

interface SparqlValidatorFormProps {
  query: string;
  endpoint: string;
  arguments?: ValidatorArgument[];
  onSelect: (value: any) => void;
  initialValue?: any;
}

const SparqlValidatorForm = ({ query, endpoint, arguments: validatorArgs = [], onSelect, initialValue }: SparqlValidatorFormProps) => {
  const [selected, setSelected] = useState<any>(initialValue || null);

  const handleSelect = (result: any) => {
    setSelected(result);
    onSelect(result);
  };

  const handleClear = () => {
    setSelected(null);
    onSelect(null);
  };

  return (
    <SparqlAutocomplete
      query={query}
      endpoint={endpoint}
      arguments={validatorArgs}
      onSelect={handleSelect}
      onClear={handleClear}
      initialSelected={initialValue}
    />
  );
};

interface SparqlAutocompleteProps {
  query: string;
  endpoint: string;
  arguments?: ValidatorArgument[];
  onSelect: (result: any) => void;
  onClear?: () => void;
  initialSelected?: any;
}

const SparqlAutocomplete = ({ query, endpoint, arguments: validatorArgs = [], onSelect, onClear, initialSelected }: SparqlAutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSelected?.label || "");
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(initialSelected || null);

  useEffect(() => {
    if (initialSelected && initialSelected.label && initialSelected.uri) {
      setSelected(initialSelected);
      setSearchTerm(initialSelected.label || "");
    }
  }, [initialSelected]);

  useEffect(() => {
    const executeSearch = async () => {
      if (searchTerm.length < 2) {
        setOptions([]);
        return;
      }

      try {
        const res = await fetch('/api/sparql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, query, term: searchTerm, arguments: validatorArgs })
        });

        if (!res.ok) {
          throw new Error(`SPARQL query failed: ${res.status}`);
        }

        const data = await res.json();
        const formatted = (data.results || []).map((b: any) => ({
          label: b.label || "",
          uri: b.uri || ""
        }));

        setOptions(formatted);
      } catch (error) {
        console.error("SPARQL search error:", error);
        setOptions([]);
      }
    };

    const debounce = setTimeout(executeSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, query, endpoint, validatorArgs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const matchedOption = options.find(opt => opt.label === value);
    if (matchedOption) {
      setSelected(matchedOption);
      setOptions([]);
      onSelect(matchedOption);
    }
  };

  const handleClear = () => {
    setSelected(null);
    setSearchTerm("");
    setOptions([]);
    onClear?.();
  };

  return (
    <div className="w-full flex items-center gap-2">
      <input
        value={searchTerm}
        onChange={handleChange}
        className="flex-1 input"
        placeholder="Search..."
        list="sparql-suggestions"
      />
      {selected && selected.label && selected.uri && (
        <button
          type="button"
          onClick={handleClear}
          className="btn btn-ghost btn-sm"
          title="Clear selection"
        >
          <Trash2 width="16" height="16" />
        </button>
      )}
      <datalist id="sparql-suggestions">
        {options.map((option, index) => (
          <option 
            key={index} 
            value={option.label}
          />
        ))}
      </datalist>
    </div>
  );
};

export { SparqlAutocomplete };
export default SparqlValidatorForm;
