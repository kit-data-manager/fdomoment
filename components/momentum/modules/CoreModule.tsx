'use client';

import React, { useState, useEffect } from 'react';
import { BasisData, ResearchDomain } from '@/lib/momentum/types';
import { ModuleShell } from './ModuleShell';
import { SearchableSelect } from '../ui/SearchableSelect';
import { ValidatedInput } from '../ui/ValidatedInput';
import { RESEARCH_DOMAINS } from '@/lib/momentum/constants';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { useOrcidImport } from '@/hooks/momentum/useOrcidImport';

interface BasisModuleProps {
  basis: BasisData;
  updateBasis: (partial: Partial<BasisData>) => void;
  onNext: () => void;
  objectType: 'dataobject' | 'software' | null;
}

export function CoreModule({
  basis,
  updateBasis,
  onNext,
  objectType,
}: BasisModuleProps) {
  const { handleOrcidLogin, isLoading: isOrcidLoading } = useOrcidImport();
  const [showOrcidError, setShowOrcidError] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleOrcidImport = async () => {
    try {
      const result = await handleOrcidLogin();
      if (result) {
        updateBasis({
          orcid: result.orcid,
          orcidName: result.name,
          orcidInstitution: result.institution,
          orcidValidated: true,
        });
      }
    } catch {
      setShowOrcidError(true);
      setTimeout(() => setShowOrcidError(false), 3000);
    }
  };

  const handleOrcidChange = (value: string) => {
    updateBasis({
      orcid: value,
      orcidValidated: false,
      orcidName: null,
      orcidInstitution: null,
    });

    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    if (value.length >= 19) {
      const timeout = setTimeout(async () => {
        if (validateOrcidFormat(value)) {
          updateBasis({
            orcidValidated: true,
            orcidName: 'Verified via ORCiD',
            orcidInstitution: 'Verified',
          });
        }
      }, 800);

      setValidationTimeout(timeout);
    }
  };

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const isFormValid =
    basis.researchDomain !== null &&
    basis.orcid.length > 0 &&
    (basis.orcidValidated || validateOrcidFormat(basis.orcid));

  const handleNext = () => {
    onNext();
  };

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
            updateBasis({ researchDomain: domain });
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
                    ? '✅ ORCiD verified'
                    : basis.orcid.length === 19 && !validateOrcidFormat(basis.orcid)
                    ? '❌ Invalid ORCiD format'
                    : undefined
                }
              />
            </div>
          </div>
          {basis.orcidValidated && basis.orcidName && (
            <div className="alert alert-success alert-sm mt-2 py-2">
              <span className="text-xs">
                👤 {basis.orcidName} · {basis.orcidInstitution}
              </span>
            </div>
          )}
        </div>
      </div>

      {isFormValid && (
        <div className="card-actions justify-end mt-6">
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
          >
            Continue →
          </button>
        </div>
      )}
    </ModuleShell>
  );
}
