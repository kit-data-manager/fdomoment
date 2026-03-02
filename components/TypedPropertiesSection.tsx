import React, { useState, useEffect } from 'react';
import { useTypeAPI } from '../utils/typeapi-client';

interface TypedPropertiesSectionProps {
  onTypeSelected: (typeId: string, value: any) => void;
}

const TypedPropertiesSection: React.FC<TypedPropertiesSectionProps> = ({ onTypeSelected }) => {
  const { searchTypes, getTypeById, resolveNestedTypes } = useTypeAPI();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [formValue, setFormValue] = useState<Record<string, any>>({});
  
  // Search for types when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchTypes(searchQuery)
        .then(results => {
          setSearchResults(results);
        })
        .catch(error => {
          console.error('Error searching types:', error);
        });
    } else {
      setSearchResults([]);
    }
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

  // Render form based on schema
  const renderForm = () => {
    if (!selectedType || !selectedType.schema) {
      return null;
    }

    const schema = selectedType.schema;
    
    if (schema.type === 'object' && schema.properties) {
      return (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">{selectedType.name}</h3>
          {Object.keys(schema.properties).map(key => {
            const property = schema.properties[key];
            const required = schema.required && schema.required.includes(key);
            
            return (
              <div key={key} className="mb-4">
                <label className="block mb-1">
                  {property.title || key}
                  {required && <span className="text-red-500"> *</span>}
                </label>
                
                {property.type === 'string' && (
                  <input
                    type="text"
                    value={(formValue[key] as string) || ''}
                    onChange={(e) => handleFormChange(key, e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={property.description || `Enter ${key}`}
                  />
                )}
                
                {property.type === 'number' && (
                  <input
                    type="number"
                    value={(formValue[key] as number) || 0}
                    onChange={(e) => handleFormChange(key, parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                    placeholder={property.description || `Enter ${key}`}
                  />
                )}
                
                {property.type === 'boolean' && (
                  <select
                    value={(formValue[key] as boolean) ? 'true' : 'false'}
                    onChange={(e) => handleFormChange(key, e.target.value === 'true')}
                    className="w-full p-2 border rounded"
                  >
                    <option value="false">False</option>
                    <option value="true">True</option>
                  </select>
                )}
                
                {property.type === 'array' && (
                  <div className="w-full p-2 border rounded">
                    <input
                      type="text"
                      value={Array.isArray(formValue[key]) ? (formValue[key] as any[]).join(', ') : ''}
                      onChange={(e) => handleFormChange(key, e.target.value.split(',').map(item => item.trim()))}
                      className="w-full"
                      placeholder={property.description || `Enter comma-separated values for ${key}`}
                    />
                  </div>
                )}
                
                {property.type === 'object' && (
                  <div className="w-full p-2 border rounded">
                    <p>Object type - not implemented in this example</p>
                  </div>
                )}
                
                {property.enum && (
                  <select
                    value={(formValue[key] as string) || ''}
                    onChange={(e) => handleFormChange(key, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select {key}</option>
                    {property.enum.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3">Typed Properties</h2>
      
      {/* Type Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Search for types..."
        />
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto border rounded">
            {searchResults.map(type => (
              <div
                key={type.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleTypeSelect(type.id)}
              >
                {type.name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected Type Form */}
      {renderForm()}
    </div>
  );
};

export default TypedPropertiesSection;