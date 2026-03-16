import { useState, useEffect } from 'react';
import { DigitalObjectModuleData } from './types';

export const useDigitalObjectAttributes = () => {
  const getInitialState = () => ({
    mimeType: '',
    license_id: '',
    license_name: '',
    contentLocation: ''
  });

  const [inputs, setInputs] = useState<DigitalObjectModuleData>(() => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }

    const digitalObjectInput = localStorage.getItem('digitalObjectAttributesInputs');

    if (digitalObjectInput) {
      try {
        return JSON.parse(digitalObjectInput);
      } catch (e) {
        console.error('Error parsing digital object attributes from localStorage:', e);
      }
    }

    return getInitialState();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('digitalObjectAttributesInputs', JSON.stringify(inputs));
    }
  }, [inputs]);

  const updateInputs = (newInputs: DigitalObjectModuleData) => {
    setInputs(newInputs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('digitalObjectAttributesInputs', JSON.stringify(newInputs));
    }
  };

  const handleMimetypeSelect = (value: string) => {
    const newInputs = { ...inputs, mimeType: value };
    updateInputs(newInputs);
  };

  const handleLicenseSelect = (id: string, name: string, url: string) => {
    const newInputs = { ...inputs, license_id: id, license_name: name };
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
