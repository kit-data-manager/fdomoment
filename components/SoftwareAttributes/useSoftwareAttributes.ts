import { useState} from 'react';
import { getRepositoryInfo } from '@/utils/git-client';
import { searchSPDXLicenses } from '@/utils/license-client';
import { SoftwareModuleData } from './types';
import { RepositoryType } from '@/utils/git-client';

export const useSoftwareAttributes = () => {
  const getInitialState = () => ({
    repositoryType: 'GitHub' as RepositoryType,
    softwareLocation: '',
    license_id: '',
    license_name: '',
    readmeLocation: ''
  });

  const [inputs, setInputs] = useState<SoftwareModuleData>(() => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }

    const softwareAttributes = localStorage.getItem('softwareAttributes');

    if (softwareAttributes) {
      try {
        return JSON.parse(softwareAttributes);
      } catch (e) {
        console.error('Error parsing software attributes from localStorage:', e);
      }
    }

    return getInitialState();
  });

  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateInputs = (newInputs: SoftwareModuleData) => {
    setInputs(newInputs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('softwareAttributes', JSON.stringify(newInputs));
    }
  };

  const setRepositoryType = (type: RepositoryType) => {
    setInputs(prev => ({ ...prev, repositoryType: type }));
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

  const handleAutoDetect = async () => {
    if (!inputs.softwareLocation) return;
    setShowError(false);
    setIsLoading(true);
    
    try {
      const info = await getRepositoryInfo(inputs.softwareLocation);
      let newInputs = { ...inputs };

      if (info.repositoryType) {
        setRepositoryType(info.repositoryType);
        newInputs = {
          ...newInputs,
          repositoryType: info.repositoryType
        };
      }

      if (info.license) {
        const license = await searchSPDXLicenses(info.license);
        if (license.length > 0) {
          newInputs = {
            ...newInputs,
            license_id: license[0].id,
            license_name: license[0].name
          };
        }
      }

      if (info.readmeUrl) {
        newInputs = {
          ...newInputs,
          readmeLocation: info.readmeUrl
        };
      }
      updateInputs(newInputs);
    } catch (error) {
      console.error('Error fetching repository info:', error);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inputs,
    setInputs,
    updateInputs,
    setRepositoryType,
    showError,
    setShowError,
    isLoading,
    handleLicenseSelect,
    handleInputChange,
    handleAutoDetect,
    repositoryType: inputs.repositoryType || 'GitHub'
  };
};
