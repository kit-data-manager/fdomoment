'use client';

import React, {useState} from 'react';
import { CoreMetadata, ResearchDomain } from '@/lib/momentum/types';
import { ModuleShell } from '../ModuleShell';
import { SearchableSelect } from '../ui/SearchableSelect';
import { ValidatedInput } from '../ui/ValidatedInput';
import { NavigationButtons } from '../ui/NavigationButtons';
import { RESEARCH_DOMAINS } from '@/lib/momentum/constants';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { useCoreModule } from './useCoreModule';
import { CoreModuleProps } from './types';
import SettingsModal from "@/components/SettingsModal";

export function CoreModule({
  basis,
  updateCore,
  onNext,
  showNext = true,
  showPrev = false,
  onPrevModule,
}: CoreModuleProps) {
  const { handleOrcidChange } = useCoreModule(updateCore);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <ModuleShell title="📋 Core Metadata" badge="required">
        <div className="alert alert-soft mb-4">
            <span className="text-xs">
                Add basic context and owner information to make your FAIR Digital Object findable and reusable.<br/><br/>
               💡 You may store both values in your <button
                type="button"
                onClick={() => {setIsSettingsOpen(true)}}
                className="text-xs text-primary hover:text-primary-focus transition-colors font-medium"
                >
                  Profile →
                </button>
            </span>
        </div>

      <div className="space-y-6">
        <SearchableSelect
          label="Research Domain"
          required
          options={RESEARCH_DOMAINS}
          value={basis.researchDomain?.id || null}
          onChange={(option) => {
            const domain = RESEARCH_DOMAINS.find(d => d.id === option.id) as ResearchDomain;
            updateCore({ researchDomain: domain });
          }}
          placeholder="Choose Research Domain..."
          hint="e.g. Information, Biology, Physics"
        />

        <div>
          <label className="label">
            <span className="label-text font-medium">
              ORCiD
              <span className="text-error ml-1">*</span>
            </span>
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <ValidatedInput
                label=""
                required={false}
                value={basis.orcid}
                onChange={handleOrcidChange}
                placeholder="0000-0000-0000-0000"
                validationState={
                  basis.orcidValidated
                    ? 'valid'
                    : basis.orcid.length > 0
                    ? validateOrcidFormat(basis.orcid)
                      ? 'valid'
                      : 'invalid'
                    : 'none'
                }
                validationMessage={
                  basis.orcidValidated
                    ? `✅ ORCiD verified (${basis.orcidName} · ${basis.orcidEmail})`
                    : basis.orcid.length === 19 && !validateOrcidFormat(basis.orcid)
                    ? '❌ Invalid ORCiD format'
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons
        showPrev={showPrev}
        showNext={showNext}
        onPrev={onPrevModule}
        onNext={onNext}
      />
        <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
        />
    </ModuleShell>

  );
}
