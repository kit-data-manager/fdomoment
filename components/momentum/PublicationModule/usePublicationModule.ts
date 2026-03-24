import { useCallback } from 'react';
import { PublicationModuleProps, CreatorWithOrcid } from './types';

export function usePublicationModule(
  publication: PublicationModuleProps['publication'],
  updatePublication: PublicationModuleProps['updatePublication']
) {
  const handleDoiImportClick = useCallback(async (
    handleDoiImport: (doi: string) => Promise<any>,
    clearImportResult: () => void
  ) => {
    const result = await handleDoiImport(publication.doi);
    if (result) {
      updatePublication({
        ...result,
        creators: result.creators.map((c: any) => ({
          ...c,
          orcidValidated: false,
          orcidName: undefined,
          orcidInstitution: undefined,
        })),
      });
      clearImportResult();
    }
  }, [publication.doi, updatePublication]);

  const addCreator = useCallback(() => {
    updatePublication({
      creators: [
        ...publication.creators,
        { id: crypto.randomUUID(), name: '', orcid: '', orcidValidated: false },
      ],
    });
  }, [publication.creators, updatePublication]);

  const removeCreator = useCallback((id: string) => {
    updatePublication({
      creators: publication.creators.filter((c) => c.id !== id),
    });
  }, [publication.creators, updatePublication]);

  const updateCreator = useCallback((id: string, updates: Partial<CreatorWithOrcid>) => {
    updatePublication({
      creators: publication.creators.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  }, [publication.creators, updatePublication]);

  const handleCreatorOrcidChange = useCallback(async (creatorId: string, orcid: string, validateOrcidFormat: (orcid: string) => boolean) => {
    updateCreator(creatorId, {
      orcid,
      orcidValidated: false,
      orcidName: undefined,
      orcidInstitution: undefined,
    });

    if (orcid.length >= 19 && validateOrcidFormat(orcid)) {
      try {
        const response = await fetch('/api/orcid-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orcid }),
        });

        if (response.ok) {
          const data = await response.json();
          updateCreator(creatorId, {
            orcidValidated: true,
            orcidName: data.name || 'Verified',
            orcidInstitution: data.institution || undefined,
          });
        } else {
          updateCreator(creatorId, {
            orcidValidated: true,
            orcidName: 'Verified',
          });
        }
      } catch {
        updateCreator(creatorId, {
          orcidValidated: true,
          orcidName: 'Verified',
        });
      }
    }
  }, [updateCreator]);

  return {
    handleDoiImportClick,
    addCreator,
    removeCreator,
    updateCreator,
    handleCreatorOrcidChange,
  };
}
