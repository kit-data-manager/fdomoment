'use client';

import React from 'react';
import { ModuleShell } from '../ModuleShell';
import { ValidatedInput } from '../ui/ValidatedInput';
import { ImportButton } from '../ui/ImportButton';
import { SearchableSelect } from '../ui/SearchableSelect';
import { PUBLICATION_TYPES } from '@/lib/momentum/constants';
import { useDoiImport } from '@/hooks/momentum/useDoiImport';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { usePublicationModule } from './usePublicationModule';
import { PublicationModuleProps, CreatorWithOrcid } from './types';

export function PublicationModule({
  publication,
  updatePublication,
}: PublicationModuleProps) {
  const {
    handleDoiImport,
    isLoading: isImportLoading,
    error: importError,
    clearImportResult,
  } = useDoiImport();

  const {
    handleDoiImportClick,
    addCreator,
    removeCreator,
    updateCreator,
    handleCreatorOrcidChange,
  } = usePublicationModule(publication, updatePublication);

  const handleImportClick = async () => {
    await handleDoiImportClick(handleDoiImport, clearImportResult);
  };

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
              required
              value={publication.doi}
              onChange={(value) => {
                updatePublication({ doi: value });
              }}
              placeholder="10.xxxx/xxxxx"
            />
          </div>
          <div className="pt-6">
            <ImportButton
              label="📥 Import"
              size="sm"
              loadingLabel="Importing..."
              onClick={handleImportClick}
              disabled={!publication.doi || isImportLoading}
            />
          </div>
        </div>

        {importError && (
          <p className="text-sm text-error">{importError}</p>
        )}

        <>
            <div className="text-xs text-base-content/50 text-center py-2 border-t border-b border-base-200">
              ── Click Import or enter manually ──
            </div>

            <ValidatedInput
              label="Title"
              required
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
                required
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
                <label className="label" >
                  <span className="label-text font-medium">Creators</span>
                  <span className="text-error ml-1">*</span>
                     {publication.creatorsImported && (
                        <div className="indicator ml-5">
                            <span className="indicator-item badge badge-primary badge-xs">Imported</span>
                            <div>&nbsp;</div>
                        </div>
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
                                handleCreatorOrcidChange(creator.id, value, validateOrcidFormat)
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
      </div>
    </ModuleShell>
  );
}
