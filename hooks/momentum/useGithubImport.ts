'use client';

import { useState } from 'react';

interface GithubImportResult {
  license: string;
  readmeUrl: string;
  stars: number;
}

export function useGithubImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseRepoInfo = (url: string, type: 'github' | 'gitlab') => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length < 2) {
        return null;
      }

      return {
        owner: pathParts[0],
        repo: pathParts[1],
      };
    } catch {
      return null;
    }
  };

  const handleAutoImport = async (
    url: string,
    type: 'github' | 'gitlab'
  ): Promise<GithubImportResult | null> => {
    const repoInfo = parseRepoInfo(url, type);
    
    if (!repoInfo) {
      setError('Ungültige Repository-URL');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/github-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Import fehlgeschlagen');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verbindung fehlgeschlagen');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleAutoImport, isLoading, error };
}
