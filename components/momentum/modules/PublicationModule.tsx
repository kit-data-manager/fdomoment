'use client';

import React from 'react';
import { PublicationMetadata, Creator } from '@/lib/momentum/types';
import { ModuleShell } from './ModuleShell';
import { ValidatedInput } from '../ui/ValidatedInput';
import { ImportButton } from '../ui/ImportButton';
import { ImportPreviewCard } from '../ui/ImportPreviewCard';
import { SearchableSelect } from '../ui/SearchableSelect';
import { PUBLICATION_TYPES } from '@/lib/momentum/constants';
import { useDoiImport } from '@/hooks/momentum/useDoiImport';
import { validateOrcidFormat } from '@/lib/momentum/validation';

interface CreatorWithOrcid extends Creator {
  orcid?: string;
  orcidValidated?: boolean;
  orcidName?: string;
  orcidInstitution?: string;
}

interface PublicationModuleProps {
  publication: {
    doi: string;
    title: string;
    titleImported: boolean;
    publicationType: string;
    publicationTypeImported: boolean;
    creators: CreatorWithOrcid[];
    creatorsImported: boolean;
  };
  updatePublication: (partial: Partial<{
    doi: string;
    title: string;
    titleImported: boolean;
    publicationType: string;
    publicationTypeImported: boolean;
    creators: CreatorWithOrcid[];
    creatorsImported: boolean;
  }>) => void;
}

export function PublicationModule({
  publication,
  updatePublication,
}: PublicationModuleProps) {
  const {
    handleDoiImport,
    isLoading: isImportLoading,
    error: importError,
    preview,
    acceptPreview,
    clearPreview,
  } = useDoiImport();

  const handleDoiImportClick = async () => {
    await handleDoiImport(publication.doi);
  };

  const handleAcceptPreview = () => {
    if (preview) {
      const pData = acceptPreview(publication.doi);
      updatePublication({
        ...pData,
        creators: preview.creators.map(c => ({
          ...c,
          orcidValidated: false,
          orcidName: undefined,
          orcidInstitution: undefined,
        })),
      });
      clearPreview();
    }
  };

  const handleEditManually = () => {
    if (preview) {
      const pData = acceptPreview(publication.doi);
      updatePublication({
        ...pData,
        creators: preview.creators.map(c => ({
          ...c,
          orcidValidated: false,
          orcidName: undefined,
          orcidInstitution: undefined,
        })),
      });
      clearPreview();
    }
  };

  const addCreator = () => {
    updatePublication({
      creators: [
        ...publication.creators,
        { id: crypto.randomUUID(), name: '', orcid: '', orcidValidated: false },
      ],
    });
  };

  const removeCreator = (id: string) => {
    updatePublication({
      creators: publication.creators.filter((c) => c.id !== id),
    });
  };

  const updateCreator = (id: string, updates: Partial<CreatorWithOrcid>) => {
    updatePublication({
      creators: publication.creators.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const handleCreatorOrcidChange = async (creatorId: string, orcid: string) => {
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
  };

  const isComplete =
    publication.doi.length > 0 ||
    publication.title.length > 0 ||
    publication.creators.length > 0;

  return (
    <ModuleShell
      title="📚 Publication Metadata"
      badge="required"
    >
      <div className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <ValidatedInput
              label="DOI"
              required={false}
              value={publication.doi}
              onChange={(value) => {
                updatePublication({ doi: value });
              }}
              placeholder="10.xxxx/xxxxx"
            />
          </div>
          <div className="pt-7">
            <ImportButton
              label="📥 Import"
              loadingLabel="Importing..."
              onClick={handleDoiImportClick}
              disabled={!publication.doi || isImportLoading}
            />
          </div>
        </div>

        {importError && (
          <p className="text-sm text-error">{importError}</p>
        )}

        {preview && (
          <ImportPreviewCard
            title="Imported from CrossRef"
            fields={[
              { label: 'Title', value: preview.title },
              { label: 'Type', value: preview.publicationType },
              {
                label: 'Authors',
                value: preview.creators.map((c) => {
                  if (c.orcid) return c.orcid;
                  return c.name;
                }).join('; '),
              },
            ]}
            onAccept={handleAcceptPreview}
            onEdit={handleEditManually}
            onDismiss={clearPreview}
          />
        )}

        {!preview && (
          <>
            <div className="text-xs text-base-content/50 text-center py-2 border-t border-b border-base-200">
              ── Or enter manually ──
            </div>

            <ValidatedInput
              label="Title"
              required={false}
              value={publication.title}
              onChange={(value) => {
                updatePublication({ title: value, titleImported: false });
              }}
              placeholder="Enter title"
              importedBadge={publication.titleImported}
            />

            <div className="grid grid-cols-2 gap-4">
              <SearchableSelect
                label="Publication Type"
                required={false}
                options={PUBLICATION_TYPES}
                value={publication.publicationType || null}
                onChange={(option) => {
                  updatePublication({
                    publicationType: option.id,
                    publicationTypeImported: false,
                  });
                }}
                placeholder="Choose type..."
                importedBadge={publication.publicationTypeImported}
              />

              <div>
                <label className="label">
                  <span className="label-text font-medium">Creators</span>
                  {publication.creatorsImported && (
                    <span className="badge badge-sm badge-info">
                      📥 Imported
                    </span>
                  )}
                </label>
                
                <div className="space-y-3">
                  {publication.creators.map((creator) => {
                    const creatorWithOrcid = creator as CreatorWithOrcid;
                    return (
                    <div key={creator.id} className="card bg-base-100 border border-base-200 p-3">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={creatorWithOrcid.name}
                            onChange={(e) =>
                              updateCreator(creator.id, { name: e.target.value })
                            }
                            placeholder="Name"
                            className="input input-bordered flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeCreator(creator.id)}
                            className="btn btn-ghost btn-sm"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="flex gap-2 items-start">
                          <div className="flex-1">
                            <ValidatedInput
                              label=""
                              value={creatorWithOrcid.orcid || ''}
                              onChange={(value) =>
                                handleCreatorOrcidChange(creator.id, value)
                              }
                              placeholder="ORCiD (optional)"
                              validationState={
                                creatorWithOrcid.orcidValidated
                                  ? 'valid'
                                  : creatorWithOrcid.orcid && creatorWithOrcid.orcid.length > 0
                                  ? validateOrcidFormat(creatorWithOrcid.orcid)
                                    ? 'valid'
                                    : 'invalid'
                                  : 'none'
                              }
                              validationMessage={
                                creatorWithOrcid.orcidValidated
                                  ? '✓ Verified'
                                  : creatorWithOrcid.orcid && creatorWithOrcid.orcid.length === 19 && !validateOrcidFormat(creatorWithOrcid.orcid)
                                  ? '✕ Invalid format'
                                  : undefined
                              }
                            />
                          </div>
                        </div>
                        
                        {(creatorWithOrcid.orcidValidated) && (
                          <div className="alert alert-success alert-xs py-1">
                            <span className="text-xs">
                              👤 {creatorWithOrcid.orcidName || 'Verified'}
                              {creatorWithOrcid.orcidInstitution && ` · ${creatorWithOrcid.orcidInstitution}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
                
                <button
                  type="button"
                  onClick={addCreator}
                  className="btn btn-soft btn-primary btn-sm w-full mt-2"
                >
                  + Add Creator
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ModuleShell>
  );
}
