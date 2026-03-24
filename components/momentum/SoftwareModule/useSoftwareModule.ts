import { useState, useCallback } from 'react';
import { SoftwareMetadata } from '@/lib/momentum/types';
import { RepositoryType } from './types';

const STORAGE_KEY = 'fdo-editor-access-tokens';

function getAccessToken(repoType: RepositoryType): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const tokens: { repoType: RepositoryType; token: string }[] = JSON.parse(stored);
      const entry = tokens.find(t => t.repoType === repoType);
      return entry?.token;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function useSoftwareModule(
  software: SoftwareMetadata,
  updateSoftware: (partial: Partial<SoftwareMetadata>) => void,
  activatePublication?: () => void,
  setActiveModule?: (module: string) => void
) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAutoImportLoading, setIsAutoImportLoading] = useState(false);
  const [autoImportError, setAutoImportError] = useState<string | null>(null);

  const parseRepoType = useCallback((url: string): RepositoryType => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      if (hostname === 'github.com') return 'GitHub';
      if (hostname === 'gitlab.com') return 'GitLab.com';
      if (hostname === 'gitlab.kit.edu') return 'GitLab@Kit';
      if (hostname === 'codebase.helmholtz.cloud') return 'Codebase@Helmholtz';
      return 'Other';
    } catch {
      return 'Other';
    }
  }, []);

  const handleAutoImportClick = useCallback(async () => {
    if (!software.repositoryUrl) return;

    setIsAutoImportLoading(true);
    setAutoImportError(null);

    const tokens: Record<RepositoryType, string | undefined> = {
      'GitHub': getAccessToken('GitHub'),
      'GitLab.com': getAccessToken('GitLab.com'),
      'Codebase@Helmholtz': getAccessToken('Codebase@Helmholtz'),
      'GitLab@Kit': getAccessToken('GitLab@Kit'),
      'Other': undefined,
    };

    try {
      const response = await fetch('/api/github-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: software.repositoryUrl,
          tokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Import failed');
      }

      const data = await response.json();
      
      updateSoftware({
        license: data.license || software.license,
        licenseImported: !!data.license,
        readmeUrl: data.readmeUrl || software.readmeUrl,
        readmeImported: !!data.readmeUrl,
      });
    } catch (err) {
      setAutoImportError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsAutoImportLoading(false);
    }
  }, [software.repositoryUrl, software.license, software.readmeUrl, updateSoftware]);

  const handleNext = useCallback(() => {
    setShowSuccess(true);
  }, []);

  const handleAddPublication = useCallback(() => {
    if (activatePublication && setActiveModule) {
      activatePublication();
      setActiveModule('publication');
    }
  }, [activatePublication, setActiveModule]);

  const handleSkip = useCallback(() => {
    setShowSuccess(false);
  }, []);

  return {
    showSuccess,
    isAutoImportLoading,
    autoImportError,
    parseRepoType,
    handleAutoImportClick,
    handleNext,
    handleAddPublication,
    handleSkip,
  };
}
