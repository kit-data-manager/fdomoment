'use client';

import React from 'react';
import { CoreMetadata, ResearchDomain } from '@/lib/momentum/types';
import { ModuleShell } from '../ModuleShell';
import { SearchableSelect } from '../ui/SearchableSelect';
import { ValidatedInput } from '../ui/ValidatedInput';
import { NavigationButtons } from '../ui/NavigationButtons';
import { RESEARCH_DOMAINS } from '@/lib/momentum/constants';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { useCoreModule } from './useCoreModule';
import { CoreModuleProps } from './types';

export function CoreModule({
  basis,
  updateCore,
  onNext,
  showNext = true,
  showPrev = false,
  onNextModule,
  onPrevModule,
}: CoreModuleProps) {
  const { handleOrcidChange } = useCoreModule(updateCore);



  return (
    <ModuleShell
      title="📋 Core Metadata"
      badge="required"
    >
      <p className="text-sm text-base-content/70 mb-6">
        This core metadata ensures basic findability and includes ownership information.
      </p>

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
    </ModuleShell>
  );
}
