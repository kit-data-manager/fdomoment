import { useState } from 'react';
import { PublicationAttributesModuleData } from './types';

export const usePublicationAttributes = (initialCreator?: string) => {
  const getInitialState = () => ({
    doi: '',
    publicationType: '',
    title: '',
    publisher: '',
    publicationYear: '',
    creator: initialCreator || ''
  });

  const [inputs, setInputs] = useState<PublicationAttributesModuleData>(() => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }
    
    const publicationInput = localStorage.getItem('publicationAttributes');
    if (publicationInput) {
      try {
        return JSON.parse(publicationInput);
      } catch (e) {
        console.error('Error parsing publication attributes from localStorage:', e);
      }
    }
  
    return getInitialState();
  });

  const updateInputs = (newInputs: PublicationAttributesModuleData) => {
    setInputs(newInputs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('publicationAttributes', JSON.stringify(newInputs));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    updateInputs(newInputs);
  };

  const handleCreatorChange = (value: string) => {
    const newInputs = { ...inputs, creator: value };
    updateInputs(newInputs);
  };

  return {
    inputs,
    handleInputChange,
    handleCreatorChange,
    updateInputs,
    setInputs
  };
};
