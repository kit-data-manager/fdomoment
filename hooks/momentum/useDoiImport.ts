'use client';

import { useState } from 'react';

interface CreatorWithOrcid {
  id: string;
  name: string;
  orcid?: string;
}

interface DoiImportPreview {
  title: string;
  publicationType: string;
  creators: CreatorWithOrcid[];
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

export function useDoiImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DoiImportPreview | null>(null);

  const handleDoiImport = async (doi: string): Promise<boolean> => {
    const normalizedDoi = doi.replace(/^https:\/\/doi\.org\//, '');
    
    if (!/^(10\.\d{4,}\/\S+)$/.test(normalizedDoi)) {
      setError('Invalid DOI format');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      const response = await fetch('/api/resolve-doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doiInput: normalizedDoi }),
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

      // Primary: Use ORCiD as creator identifier
      const creators: CreatorWithOrcid[] = [];
      
      if (metadata.creators && Array.isArray(metadata.creators)) {
        metadata.creators.forEach((c: { familyName?: string; givenName?: string; orcid?: string }) => {
          if (c.orcid) {
            // If ORCiD exists, use it as the primary identifier
            creators.push({
              id: crypto.randomUUID(),
              name: c.orcid,
              orcid: c.orcid,
            });
          } else if (c.familyName || c.givenName) {
            // Fallback to name if no ORCiD
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

      // If no creators with ORCiD found, try creatorsString
      if (creators.length === 0 && metadata.creatorsString) {
        metadata.creatorsString.split(',').forEach((name: string) => {
          creators.push({
            id: crypto.randomUUID(),
            name: name.trim()
          });
        });
      }

      setPreview({
        title: metadata.title || 'Unknown Title',
        publicationType: metadata.publicationType || 'Unknown',
        creators: creators,
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptPreview = (doi: string): PublicationDataWithCreators => {
    if (!preview) {
      throw new Error('No preview available');
    }

    return {
      doi: normalizedDoi(doi),
      title: preview.title,
      titleImported: true,
      publicationType: preview.publicationType,
      publicationTypeImported: true,
      creators: preview.creators,
      creatorsImported: true,
    };
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return { handleDoiImport, isLoading, error, preview, acceptPreview, clearPreview };
}

function normalizedDoi(doi: string): string {
  return doi.replace(/^https:\/\/doi\.org\//, '');
}
