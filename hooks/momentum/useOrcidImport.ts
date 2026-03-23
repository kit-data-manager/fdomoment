'use client';

import { useState } from 'react';

interface OrcidImportResult {
  orcid: string;
  name: string;
  institution: string | null;
}

export function useOrcidImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrcidLogin = async (): Promise<OrcidImportResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResult: OrcidImportResult = {
        orcid: '0000-0000-0000-0000',
        name: 'Max Mustermann',
        institution: 'Beispiel Universität',
      };

      return mockResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ORCiD Import failed.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleOrcidLogin, isLoading, error };
}
