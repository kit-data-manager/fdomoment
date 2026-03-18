import { useState } from 'react';
import { DataObjectModuleData } from './types';

export const useDataObjectAttributes = () => {
  const getInitialState = () => ({
    mimeType: '',
    license_id: '',
    license_name: '',
    dataObjectLocation: ''
  });

  const [inputs, setInputs] = useState<DataObjectModuleData>(() => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }

    const dataObjectAttributes = localStorage.getItem('dataObjectAttributes');

    if (dataObjectAttributes) {
      try {
        return JSON.parse(dataObjectAttributes);
      } catch (e) {
        console.error('Error parsing data object attributes from localStorage:', e);
      }
    }

    return getInitialState();
  });

  const updateInputs = (newInputs: DataObjectModuleData) => {
    setInputs(newInputs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dataObjectAttributes', JSON.stringify(newInputs));
    }
  };

  const handleMimetypeSelect = (value: string) => {
    const newInputs = { ...inputs, mimeType: value };
    updateInputs(newInputs);
  };

  const handleLicenseSelect = (id: string, name: string, url: string) => {
    const newInputs = { ...inputs, license_id: id, license_name: name, url: url };
    updateInputs(newInputs);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    updateInputs(newInputs);
  };

  return {
    inputs,
    handleMimetypeSelect,
    handleLicenseSelect,
    handleInputChange,
    setInputs
  };
};
