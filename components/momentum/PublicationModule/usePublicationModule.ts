import { useCallback } from 'react';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { getOrcidMetadata } from '@/utils/orcid-client';
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
      // Validate ORCiDs for imported creators
      const validatedCreators = await Promise.all(
        result.creators.map(async (c: any) => {
          if (c.orcid && validateOrcidFormat(c.orcid)) {
            const metadata = await getOrcidMetadata(c.orcid);
            return {
              ...c,
              orcidValidated: true,
              orcidName: metadata?.name || 'Verified via ORCiD',
              orcidEmail: metadata?.email || undefined,
            };
          }
          return {
            ...c,
            orcidValidated: false,
            orcidName: undefined,
            orcidEmail: undefined,
          };
        })
      );

      updatePublication({
        ...result,
        creators: validatedCreators,
      });
      clearImportResult();
    }
  }, [publication.doi, updatePublication]);

  const addCreator = useCallback(() => {
    updatePublication({
      creators: [
        ...publication.creators,
        { id: crypto.randomUUID(), orcid: '', orcidValidated: false, orcidName: undefined, orcidEmail: undefined },
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

  const handleCreatorOrcidChange = useCallback(async (creatorId: string, orcid: string) => {
    updateCreator(creatorId, {
      orcid,
      orcidValidated: false,
      orcidName: undefined,
      orcidEmail: undefined,
    });

    if (orcid.length >= 19 && validateOrcidFormat(orcid)) {
      const metadata = await getOrcidMetadata(orcid);
      updateCreator(creatorId, {
        orcidValidated: true,
        orcidName: metadata?.name || 'Verified via ORCiD',
        orcidEmail: metadata?.email || undefined,
      });
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
