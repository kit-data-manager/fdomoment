import { useState, useEffect, useCallback } from 'react';
import { DataObjectMetadata } from '@/lib/momentum/types';
import { validateUrl } from '@/lib/momentum/validation';

export function useDataObjectModule(
  dataobject: DataObjectMetadata,
  updateDataobject: (partial: Partial<DataObjectMetadata>) => void
) {
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const triggerUrlValidation = useCallback((url: string) => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const timeout = setTimeout(async () => {
      if (url.length > 0) {
        const result = await validateUrl(url);
        updateDataobject({
          dataUrlValidated: result.valid,
          dataUrlRepository: result.repository,
        });
      }
    }, 800);

    setValidationTimeout(timeout);
  }, [validationTimeout, updateDataobject]);

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const handleDataUrlChange = useCallback((value: string) => {
    updateDataobject({
      dataUrl: value,
      dataUrlValidated: false,
      dataUrlRepository: null,
    });
    triggerUrlValidation(value);
  }, [triggerUrlValidation, updateDataobject]);

  const handleNext = useCallback(() => {
  }, []);

  return {
    validationTimeout,
    handleDataUrlChange,
    handleNext,
  };
}
