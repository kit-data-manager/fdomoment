import React, { useState, useEffect } from 'react';
import { useTypeAPI } from '../utils/typeapi-client';
import Form from '@rjsf/core';
import ajv from '@rjsf/validator-ajv8'

interface TypedPropertiesSectionProps {
  onTypeSelected: (typeId: string, value: any) => void;
}

const TypedPropertiesSection: React.FC<TypedPropertiesSectionProps> = ({ onTypeSelected }) => {
  const { searchTypes, getTypeById, resolveNestedTypes } = useTypeAPI();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [formValue, setFormValue] = useState<Record<string, any>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Search for types with debounced search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 5) {
        try {
          const results = await searchTypes(searchQuery);
          setSearchResults(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error searching types:', error);
          setSearchResults([]);
          setShowSuggestions(false);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    };
    
    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchQuery, searchTypes]);

  // Handle type selection
  const handleTypeSelect = async (typeId: string) => {
    try {
      // Get the selected type
      const type = await getTypeById(typeId);
      
      // If it's a combined attribute, resolve nested types
      let resolvedType = type;
      if (type.type === 'FdoCombinedAttribute') {
        resolvedType = await resolveNestedTypes(type);
      }
      
      setSelectedType(resolvedType);
      
      // Initialize form value based on schema
      const initialValue: Record<string, any> = {};
      if (resolvedType.schema && resolvedType.schema.properties) {
        Object.keys(resolvedType.schema.properties).forEach(key => {
          const property = resolvedType.schema.properties[key];
          if (property.type === 'string') {
            initialValue[key] = '';
          } else if (property.type === 'number') {
            initialValue[key] = 0;
          } else if (property.type === 'boolean') {
            initialValue[key] = false;
          } else if (property.type === 'array') {
            initialValue[key] = [];
          } else if (property.type === 'object') {
            initialValue[key] = {};
          }
        });
      }
      setFormValue(initialValue);
      
      // Clear search query and hide suggestions
      setSearchQuery('');
      setShowSuggestions(false);
      
      // Notify parent component
      onTypeSelected(typeId, initialValue);
    } catch (error) {
      console.error('Error selecting type:', error);
    }
  };

  // Handle form value changes
  const handleFormChange = (key: string, value: any) => {
    const newFormValue: Record<string, any> = { ...formValue, [key]: value };
    console.log("CHANGE", newFormValue);
    setFormValue(newFormValue);
    
    // Notify parent component with updated value
    if (selectedType) {
      onTypeSelected(selectedType.id, newFormValue);
    }
  };

  // Render form using RJSF
  const renderForm = () => {
    if (!selectedType || !selectedType.schema) {
      return null;
    }

    const schema = selectedType.schema;
    
    // Use ajv8 validator for RJSF
    const validator = ajv;
    
    return (
      <div className="mt-4 p-4 border rounded">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{selectedType.name}</h3>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              setSelectedType(null);
              setFormValue({});
              setSearchQuery('');
              setShowSuggestions(false);
            }}
          >
            ×
          </button>
        </div>
        <Form
          schema={schema}
          formData={formValue}
          onChange={({ formData }) => {
            if (formData) {
              setFormValue(formData);
              if (selectedType) {
                onTypeSelected(selectedType.id, formData);
              }
            }
          }}
          onSubmit={({ formData }) => {
            if (formData) {
              if (selectedType) {
                onTypeSelected(selectedType.id, formData);
              }
            }
          }}
          liveValidate={true}
          validator={validator}
          className="w-full"
        >
          <div className="mt-4">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3">Typed Properties</h2>
      
      {/* Type Search or Selected Type Display */}
      <div className="mb-4">
        {selectedType ? (
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="flex items-center">
              {selectedType.name} ({selectedType.id})
            </span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setSelectedType(null);
                setFormValue({});
                setSearchQuery('');
                setShowSuggestions(false);
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Search for types..."
              onFocus={() => searchQuery.length >= 5 && setShowSuggestions(true)}
            />
            
            {/* Search Results */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                {searchResults.map(type => (
                  <div
                    key={type.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    {type.name} ({type.id})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Selected Type Form */}
      {renderForm()}
    </div>
  );
};

export default TypedPropertiesSection;
