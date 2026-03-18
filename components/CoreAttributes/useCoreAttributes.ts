import { useState } from 'react';
import { OwnerIdType } from '@/components/OwnerIdAutocomplete';
import {CoreAttributesModuleData} from "@/components/CoreAttributes/types";

export const useCoreAttributes = () => {
  const getInitialState = () => ({
    owner_id: '',
    owner_name: '',
    owner_display: '',
    owner_id_type: 'ORCiD' as OwnerIdType,
    research_field: ''
  });

  const [inputs, setInputs] = useState<CoreAttributesModuleData>(() => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }
    
    const coreAttributes = localStorage.getItem('coreAttributes');
    if (coreAttributes) {
      try {
        return JSON.parse(coreAttributes);
      } catch (e) {
        console.error('Error parsing core attributes from localStorage:', e);
      }
    }
  
    return getInitialState();
  });

  const updateInputs = (newInputs: CoreAttributesModuleData) => {
    setInputs(newInputs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('coreAttributes', JSON.stringify(newInputs));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    updateInputs(newInputs);
  };

  const handleOwnerIdChange = (value: string) => {
    const newInputs = { 
      ...inputs, 
      owner_id: value,
      owner_display: value
    };
    updateInputs(newInputs);
  };

  const handleOwnerIdSelect = (id: string, name: string, type: OwnerIdType) => {
    const newInputs = { 
      ...inputs, 
      owner_id: id, 
      owner_name: name,
      owner_display: `${name} (${id})`,
      owner_id_type: type
    };
    updateInputs(newInputs);
  };

  const handleTypeChange = (type: OwnerIdType) => {
    const newInputs = { 
      ...inputs, 
      owner_id_type: type,
      owner_id: '',
      owner_name: '',
      owner_display: ''
    };
    updateInputs(newInputs);
  };

  return {
    inputs,
    handleChange,
    handleOwnerIdChange,
    handleOwnerIdSelect,
    handleTypeChange
  };
};
