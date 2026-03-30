'use client';

import React from 'react';
import { ModuleShell } from '../ModuleShell';
import { ValidatedInput } from '../ui/ValidatedInput';
import { ImportButton } from '../ui/ImportButton';
import { SearchableSelect } from '../ui/SearchableSelect';
import { NavigationButtons } from '../ui/NavigationButtons';
import { PUBLICATION_TYPES } from '@/lib/momentum/constants';
import { useDoiImport } from '@/hooks/momentum/useDoiImport';
import { usePublicationModule } from './usePublicationModule';
import { PublicationModuleProps, CreatorWithOrcid } from './types';

interface CreatorInputProps {
  creator: CreatorWithOrcid;
  onChange: (creatorId: string, value: string) => void;
  onRemove: () => void;
}

function CreatorInput({ creator, onChange, onRemove }: CreatorInputProps) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        <ValidatedInput
          label=""
          required
          value={creator.orcid || ''}
          onChange={(value) => onChange(creator.id, value)}
          placeholder="Creator ORCiD (0000-0000-0000-0000)"
          validationState={
            creator.orcidValidated
              ? 'valid'
              : creator.orcid && creator.orcid.length > 0
              ? 'pending'
              : 'none'
          }
          validationMessage={
            creator.orcidValidated
              ? `✅ ORCiD verified (${creator.orcidName || 'Verified'}${creator.orcidEmail ? ` · ${creator.orcidEmail}` : ''})`
              : undefined
          }
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-ghost btn-sm mt-7"
      >
        ✕
      </button>
    </div>
  );
}

export function PublicationModule({
  publication,
  updatePublication,
  showNext = true,
  showPrev = false,
  onNextModule,
  onPrevModule,
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
    handleCreatorOrcidChange,
  } = usePublicationModule(publication, updatePublication);

  const handleImportClick = async () => {
    await handleDoiImportClick(handleDoiImport, clearImportResult);
  };

  return (
    <ModuleShell title="📚 Publication Metadata" badge="required">
        <div className="alert alert-soft mb-4">
                <span className="text-xs">
                  Add publication-related information starting with a DOI. Then,
                </span>
        </div>
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
              ── Try to import from DOI or enter manually ──
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
              <label className="label">
                <span className="label-text font-medium">
                  Creators
                  <span className="text-error ml-1">*</span>
                </span>
                {publication.creatorsImported && (
                  <div className="indicator ml-5">
                    <span className="indicator-item badge badge-primary badge-xs">Imported</span>
                    <div>&nbsp;</div>
                  </div>
                )}
              </label>
              
              <div className="space-y-3">
                {publication.creators.map((creator) => (
                  <CreatorInput
                    key={creator.id}
                    creator={creator as CreatorWithOrcid}
                    onChange={handleCreatorOrcidChange}
                    onRemove={() => removeCreator(creator.id)}
                  />
                ))}
              </div>
              
              <button
                type="button"
                onClick={addCreator}
                className="btn btn-soft btn-primary btn-sm w-full mt-3"
              >
                + Add Creator
              </button>
            </div>
        </>
      </div>
      
      <NavigationButtons
        showPrev={showPrev}
        showNext={showNext}
        onPrev={onPrevModule}
        onNext={onNextModule}
      />
    </ModuleShell>
  );
}
