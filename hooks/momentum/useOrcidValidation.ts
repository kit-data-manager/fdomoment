import { useState, useEffect, useCallback } from 'react';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { getOrcidMetadata } from '@/utils/orcid-client';

export interface OrcidValidationResult {
  orcid: string;
  orcidValidated: boolean;
  orcidName?: string;
  orcidEmail?: string;
  orcidInstitution?: string;
}

export function useOrcidValidation(
  onUpdate: (updates: Partial<OrcidValidationResult>) => void
) {
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleOrcidChange = useCallback((value: string) => {
    // Reset validation state
    onUpdate({
      orcid: value,
      orcidValidated: false,
      orcidName: undefined,
      orcidEmail: undefined,
      orcidInstitution: undefined,
    });

    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    if (value.length >= 19) {
      const timeout = setTimeout(async () => {
        if (validateOrcidFormat(value)) {
          const metadata = await getOrcidMetadata(value);
          onUpdate({
            orcidValidated: true,
            orcidName: metadata?.name || 'Verified via ORCiD',
            orcidEmail: metadata?.email || undefined,
          });
        }
      }, 800);

      setValidationTimeout(timeout);
    }
  }, [validationTimeout, onUpdate]);

  // Cleanup timeout on unmount
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
