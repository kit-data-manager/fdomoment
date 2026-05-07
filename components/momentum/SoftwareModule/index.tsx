'use client';

import React, {useState} from 'react';
import { ModuleShell } from '../ModuleShell';
import { ValidatedInput } from '../ui/ValidatedInput';
import { ImportButton } from '../ui/ImportButton';
import { NavigationButtons } from '../ui/NavigationButtons';
import { SOFTWARE_LICENSES } from '@/lib/momentum/constants';
import { SearchableSelect } from '../ui/SearchableSelect';
import { useSoftwareModule } from './useSoftwareModule';
import { SoftwareModuleProps, RepositoryType } from './types';
import SettingsModal from "@/components/SettingsModal";

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
    isAutoImportLoading,
    autoImportError,
    parseRepoType,
    handleAutoImportClick,
    handleRepositoryUrlChange,
  } = useSoftwareModule(software, updateSoftware, activatePublication, setActiveModule);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const repoType = software.repositoryType || parseRepoType(software.repositoryUrl);

  return (
    <ModuleShell title="💻 Software Metadata" badge="required">
        <div className="alert alert-soft mb-4">
                <span className="text-xs">
                    To extract software metadata, first select the repository platform where your software is hosted and
                    paste the repository URL. From known platforms you may then 📥 Import all required metadata
                    automatically. Afterwards, if required, complete missing fields manually.<br/><br/>
                    💡 For known repository platforms you may set an Access Token in your <button
                    type="button"
                    onClick={() => {
                        setIsSettingsOpen(true)
                    }}
                    className="text-xs text-primary hover:text-primary-focus transition-colors font-medium"
                >
                  Profile →
                </button>  to read from protected repositories.
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
                repositoryType: type,
                repositoryUrl: type === 'Other' ? '' : baseUrl,
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
              onChange={handleRepositoryUrlChange}
              placeholder={repoType === 'Other' ? 'https://...' : `https://${repoType.toLowerCase().split('@')[0].replace(' ', '.')}/owner/repo`}
              validationState={
                software.repositoryUrlValidated
                  ? 'valid'
                  : software.repositoryUrl.length > 0
                  ? 'pending'
                  : 'none'
              }
              validationMessage={
                software.repositoryUrlValidated
                  ? '✅ Accessible'
                  : undefined
              }
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
          <p className="text-sm text-red-600">❌ {autoImportError}</p>
        )}

          { !autoImportError && !software.hasMetadata && (
              <p className="text-sm text-yellow-600">⚠️ Add Citation.cff or codemeta.json to improve FAIR-Score.</p>
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
        <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
        />
    </ModuleShell>
  );
}
