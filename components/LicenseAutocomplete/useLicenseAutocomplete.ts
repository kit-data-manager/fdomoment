import { useState, useEffect } from 'react';
import { getSPDXLicenses, SPDXLicense } from '@/utils/license-client';

export const useLicenseAutocomplete = () => {
  const [licenses, setLicenses] = useState<SPDXLicense[]>([]);

  useEffect(() => {
    setLicenses(getSPDXLicenses());
  }, []);

  const handleChange = (
    selectedValue: string,
    licensesList: SPDXLicense[],
    onSelect: (id: string, name: string, url: string) => void
  ) => {
    if (selectedValue) {
      const selectedItem = licensesList.find(item => item.id === selectedValue);
      if (selectedItem) {
        onSelect(selectedItem.id, selectedItem.name, selectedItem.url);
      }
    }
  };

  const clearSelection = (
    onChange: (value: string) => void,
    onSelect: (id: string, name: string, url: string) => void
  ) => {
    onChange('');
    onSelect('', '', '');
  };

  return {
    licenses,
    handleChange,
    clearSelection
  };
};
