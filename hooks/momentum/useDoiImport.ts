'use client';

import { useState } from 'react';

interface CreatorWithOrcid {
  id: string;
  name: string;
  orcid?: string;
}

interface PublicationDataWithCreators {
  doi: string;
  title: string;
  titleImported: boolean;
  publicationType: string;
  publicationTypeImported: boolean;
  creators: CreatorWithOrcid[];
  creatorsImported: boolean;
}

interface DoiImportResult {
  data: PublicationDataWithCreators;
  doi: string;
}

export function useDoiImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<DoiImportResult | null>(null);

  const handleDoiImport = async (doi: string): Promise<PublicationDataWithCreators | null> => {
    const normalized = normalizedDoi(doi);
    
    if (!/^(10\.\d{4,}\/\S+)$/.test(normalized)) {
      setError('Invalid DOI format');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setImportResult(null);

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

      const creators: CreatorWithOrcid[] = [];
      
      if (metadata.creators && Array.isArray(metadata.creators)) {
        metadata.creators.forEach((c: { familyName?: string; givenName?: string; orcid?: string }) => {
          if (c.orcid) {
            creators.push({
              id: crypto.randomUUID(),
              name: c.orcid,
              orcid: c.orcid,
            });
          } else if (c.familyName || c.givenName) {
            const name = `${c.familyName || ''} ${c.givenName || ''}`.trim();
            if (name) {
              creators.push({
                id: crypto.randomUUID(),
                name,
              });
            }
          }
        });
      }

      if (creators.length === 0 && metadata.creatorsString) {
        metadata.creatorsString.split(',').forEach((name: string) => {
          creators.push({
            id: crypto.randomUUID(),
            name: name.trim()
          });
        });
      }

      const data: PublicationDataWithCreators = {
        doi: normalized,
        title: metadata.title || 'Unknown Title',
        titleImported: true,
        publicationType: metadata.publicationType || 'Unknown',
        publicationTypeImported: true,
        creators,
        creatorsImported: true,
      };

      setImportResult({ data, doi: normalized });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearImportResult = () => {
    setImportResult(null);
    setError(null);
  };

  return { 
    handleDoiImport, 
    isLoading, 
    error, 
    importResult,
    clearImportResult 
  };
}

function normalizedDoi(doi: string): string {
  return doi.replace(/^https:\/\/doi\.org\//, '');
}
