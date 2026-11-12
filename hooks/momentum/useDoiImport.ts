'use client';

import { useState } from 'react';
import { Creator } from '@/lib/momentum/types';

interface PublicationDataWithCreators {
  doi: string;
  title: string;
  titleImported: boolean;
  publicationType: string;
  publicationTypeImported: boolean;
  creators: Creator[];
  creatorsImported: boolean;
}

export function useDoiImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDoiImport = async (doi: string): Promise<PublicationDataWithCreators | null> => {
    const normalized = normalizedDoi(doi);
    
    if (!/^(10\.\d{4,}\/\S+)$/.test(normalized)) {
      setError('Invalid DOI format');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/resolve-doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doiInput: normalized }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'DOI not found.');
      }

      const result = await response.json();
      
      if (!result.success || !result.metadata) {
        throw new Error('Could not resolve DOI metadata');
      }

      const metadata = result.metadata;

      const creators: Creator[] = [];
      
      if (metadata.creators && Array.isArray(metadata.creators)) {
        metadata.creators.forEach((c: { familyName?: string; givenName?: string; orcid?: string }) => {
          //only use creators with orcid
          if (c.orcid) {
            creators.push({
              id: crypto.randomUUID(),
              name: c.orcid,
              orcid: c.orcid,
            });
          }
        });
      }

      const creatorsImported = creators.length != 0;

      const data: PublicationDataWithCreators = {
        doi: normalized,
        title: metadata.title || 'Unknown Title',
        titleImported: true,
        publicationType: metadata.publicationType || 'Unknown',
        publicationTypeImported: true,
        creators,
        creatorsImported: creatorsImported,
      };

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearImportResult = () => {
    setError(null);
  };

  return { 
    handleDoiImport, 
    isLoading, 
    error, 
    clearImportResult 
  };
}

function normalizedDoi(doi: string): string {
  return doi.replace(/^https:\/\/doi\.org\//, '');
}
