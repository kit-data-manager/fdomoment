import { useState, useCallback } from 'react';
import { TypedAttributesItem, TypedAttributesModuleData } from './types';

export const useTypedAttributes = () => {
  const [moduleData, setModuleData] = useState<TypedAttributesModuleData>(() => {
    if (typeof window === 'undefined') {
      return { properties: [] };
    }
    
    const stored = localStorage.getItem('typedAttributes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          properties: Array.isArray(parsed) ? parsed : (parsed.properties || [])
        };
      } catch (e) {
        console.error('Error parsing stored typed attributes:', e);
      }
    }
    return { properties: [] };
  });

  const updateModuleData = useCallback((newData: TypedAttributesModuleData) => {
    setModuleData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typedAttributes', JSON.stringify(newData));
    }
    return newData;
  }, []);

  const addAttribute = useCallback((property: TypedAttributesItem) => {
    setModuleData(prev => {
      const newData = { properties: [...prev.properties, property] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('typedAttributes', JSON.stringify(newData));
      }
      return newData;
    });
  }, []);

  const updateAttribute = useCallback((index: number, property: TypedAttributesItem) => {
    setModuleData((prev: TypedAttributesModuleData) => {
      const updatedProperties = [...prev.properties];
      updatedProperties[index] = property;
      const newData = { properties: updatedProperties };
      if (typeof window !== 'undefined') {
        localStorage.setItem('typedAttributes', JSON.stringify(newData));
      }
      return newData;
    });
  }, []);

  const removeAttribute = useCallback((index: number) => {
    setModuleData((prev: TypedAttributesModuleData) => {
      const newData = { properties: prev.properties.filter((_: TypedAttributesItem, i: number) => i !== index) };
      if (typeof window !== 'undefined') {
        localStorage.setItem('typedAttributes', JSON.stringify(newData));
      }
      return newData;
    });
  }, []);

  return {
    properties: moduleData.properties,
    addProperty: addAttribute,
    updateProperty: updateAttribute,
    removeProperty: removeAttribute,
    updateModuleData
  };
};

export default useTypedAttributes;
