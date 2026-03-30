'use client';

import React from 'react';
import { ModuleShell } from '../ModuleShell';
import { ValidatedInput } from '../ui/ValidatedInput';
import { ImportButton } from '../ui/ImportButton';
import { NavigationButtons } from '../ui/NavigationButtons';
import { SOFTWARE_LICENSES } from '@/lib/momentum/constants';
import { SearchableSelect } from '../ui/SearchableSelect';
import { useSoftwareModule } from './useSoftwareModule';
import { SoftwareModuleProps, RepositoryType } from './types';

export function SoftwareModule({
  software,
  updateSoftware,
  activatePublication,
  setActiveModule,
  showNext = true,
  showPrev = false,
  onNextModule,
  onPrevModule,
}: SoftwareModuleProps) {
  const {
    showSuccess,
    isAutoImportLoading,
    autoImportError,
    parseRepoType,
    handleAutoImportClick,
    handleAddPublication,
    handleSkip,
  } = useSoftwareModule(software, updateSoftware, activatePublication, setActiveModule);



  const repoType = parseRepoType(software.repositoryUrl);

  if (showSuccess) {
    return (
      <ModuleShell title="💻 Software Metadata" badge="required">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800 mb-2">
            ✅ Software Metadata complete!
          </p>
          <p className="text-sm text-green-700 mb-3">
            Do you want to add more metadata?
          </p>
          <div className="text-sm text-green-700 mb-4">
            💡 Add Publication Metadata: +22% Score
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddPublication}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add module
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Skip →
            </button>
          </div>
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title="💻 Software Metadata" badge="required">
        <div className="alert alert-soft mb-4">
                <span className="text-xs">
                  Either select a suggested attribute key from below or add a custom attribute with your own key and value.
                </span>
        </div>
      <div className="space-y-6">
        <div>
          <label className="label">
            <span className="label-text font-medium">Repository Platform</span>
              <span className="text-error">*</span>

          </label>
          <select
            className="select select-bordered w-full"
            value={repoType}
            onChange={(e) => {
              const type = e.target.value as RepositoryType;
              let baseUrl = '';
              if (type === 'GitHub') baseUrl = 'https://github.com/';
              else if (type === 'GitLab.com') baseUrl = 'https://gitlab.com/';
              else if (type === 'Codebase@Helmholtz') baseUrl = 'https://codebase.helmholtz.cloud/';
              else if (type === 'GitLab@Kit') baseUrl = 'https://gitlab.kit.edu/';
              
              updateSoftware({ 
                repositoryUrl: baseUrl || software.repositoryUrl,
              });
            }}
          >
            <option value="GitHub">GitHub</option>
            <option value="GitLab.com">GitLab.com</option>
            <option value="Codebase@Helmholtz">Codebase@Helmholtz</option>
            <option value="GitLab@Kit">GitLab@Kit</option>
            <option value="Other">Other</option>
          </select>
          {repoType === 'Other' && software.repositoryUrl && (
            <label className="label">
              <span className="label-text-alt text-warning">
                ⚠️ Import not available for custom repository platforms.
              </span>
            </label>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <ValidatedInput
              label="Repository URL"
              required
              type="url"
              value={software.repositoryUrl}
              onChange={(value) => {
                updateSoftware({ repositoryUrl: value });
              }}
              placeholder={repoType === 'Other' ? 'https://...' : `https://${repoType.toLowerCase().split('@')[0].replace(' ', '.')}/owner/repo`}
            />
          </div>
          <div className="pt-6">
              <ImportButton
                  label="📥 Import"
                  size="sm"
                  loadingLabel="Importing..."
                  onClick={handleAutoImportClick}
                  disabled={!software.repositoryUrl || isAutoImportLoading || repoType === 'Other'}

              />
          </div>
        </div>
        
        {autoImportError && (
          <p className="text-sm text-red-600">{autoImportError}</p>
        )}

        <SearchableSelect
          label="License"
          required
          options={SOFTWARE_LICENSES}
          value={software.license || null}
          onChange={(option) => {
            updateSoftware({ license: option.id, licenseImported: false });
          }}
          placeholder="Choose license..."
          importedBadge={software.licenseImported}
        />

        <ValidatedInput
          label="README URL"
          required
          type="url"
          value={software.readmeUrl}
          onChange={(value) => {
            updateSoftware({ readmeUrl: value, readmeImported: false });
          }}
          placeholder="https://..."
          importedBadge={software.readmeImported}
        />
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
