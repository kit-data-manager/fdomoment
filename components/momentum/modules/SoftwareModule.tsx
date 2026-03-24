'use client';

import React, { useState } from 'react';
import { SoftwareMetadata } from '@/lib/momentum/types';
import { ModuleShell } from './ModuleShell';
import { ValidatedInput } from '../ui/ValidatedInput';
import { ImportButton } from '../ui/ImportButton';
import { SOFTWARE_LICENSES } from '@/lib/momentum/constants';
import { SearchableSelect } from '../ui/SearchableSelect';

type RepositoryType = 'GitHub' | 'GitLab.com' | 'Codebase@Helmholtz' | 'GitLab@Kit' | 'Other';

interface SoftwareModuleProps {
  software: SoftwareMetadata;
  updateSoftware: (partial: Partial<SoftwareMetadata>) => void;
  activatePublication?: () => void;
  setActiveModule?: (module: string) => void;
}

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

export function SoftwareModule({
  software,
  updateSoftware,
  activatePublication,
  setActiveModule,
}: SoftwareModuleProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAutoImportLoading, setIsAutoImportLoading] = useState(false);
  const [autoImportError, setAutoImportError] = useState<string | null>(null);

  const parseRepoType = (url: string): RepositoryType => {
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
  };

  const handleAutoImportClick = async () => {
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
  };

  const isFormValid =
    software.repositoryUrl.length > 0 && software.license.length > 0;

  const handleNext = () => {
    setShowSuccess(true);
  };

  const handleAddPublication = () => {
    if (activatePublication && setActiveModule) {
      activatePublication();
      setActiveModule('publication');
    }
  };

  const handleSkip = () => {
    setShowSuccess(false);
  };

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
      <div className="space-y-6">
        <div>
          <label className="label">
            <span className="label-text font-medium">Repository Platform</span>
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

      {isFormValid && (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Continue →
          </button>
        </div>
      )}
    </ModuleShell>
  );
}
