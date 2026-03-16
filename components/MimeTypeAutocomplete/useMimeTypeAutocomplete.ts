import { useState, useEffect } from 'react';
import { getMimeTypes } from '@/utils/mimetype-client';
import {MimeType} from "@/components/MimeTypeAutocomplete/types";

export const useMimeTypeAutocomplete = () => {
  const [mimeTypes, setMimeTypes] = useState<MimeType[]>([]);

  useEffect(() => {
    getMimeTypes().then(setMimeTypes);
  }, []);

  const handleChange = (
    selectedValue: string,
    mimeTypesList: MimeType[],
    onSelect: (type: string, description: string) => void
  ) => {
    if (selectedValue) {
      const selectedItem = mimeTypesList.find(item => item.type === selectedValue);
      if (selectedItem) {
        onSelect(selectedItem.type, selectedItem.description);
      }
    }
  };

  const clearSelection = (
    onChange: (value: string) => void,
    onSelect: (type: string, description: string) => void
  ) => {
    onChange('');
    onSelect('', '');
  };

  return {
    mimeTypes,
    handleChange,
    clearSelection
  };
};
