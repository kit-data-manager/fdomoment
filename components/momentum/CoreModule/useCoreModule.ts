import { useState, useEffect, useCallback } from 'react';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { getOrcidMetadata } from '@/utils/orcid-client';
import { CoreMetadata } from '@/lib/momentum/types';

export function useCoreModule(updateCore: (partial: Partial<CoreMetadata>) => void) {
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleOrcidChange = useCallback((value: string) => {
    updateCore({
      orcid: value,
      orcidValidated: false,
      orcidName: null,
      orcidEmail: null,
    });

    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    if (value.length >= 19) {
      const timeout = setTimeout(async () => {
        if (validateOrcidFormat(value)) {
          const metadata = await getOrcidMetadata(value);
          updateCore({
            orcidValidated: true,
            orcidName: metadata?.name || 'Verified via ORCiD',
            orcidEmail: metadata?.email || 'Unknown',
          });
        }
      }, 800);

      setValidationTimeout(timeout);
    }
  }, [validationTimeout, updateCore]);

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  return {
    handleOrcidChange,
  };
}
