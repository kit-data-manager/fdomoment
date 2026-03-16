import { useState, useEffect } from 'react';
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

    const softwareInputs = localStorage.getItem('softwareAttributesInputs');

    if (softwareInputs) {
      try {
        return JSON.parse(softwareInputs);
      } catch (e) {
        console.error('Error parsing software attributes from localStorage:', e);
      }
    }

    return getInitialState();
  });

  const [repositoryType, setRepositoryType] = useState<RepositoryType>('GitHub');
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('softwareAttributesInputs', JSON.stringify(inputs));
    }
  }, [inputs]);

  const updateInputs = (newInputs: SoftwareModuleData) => {
    setInputs(newInputs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('softwareAttributesInputs', JSON.stringify(newInputs));
    }
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
      setInputs(newInputs);
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
    repositoryType,
    setRepositoryType,
    showError,
    setShowError,
    isLoading,
    handleLicenseSelect,
    handleInputChange,
    handleAutoDetect
  };
};
