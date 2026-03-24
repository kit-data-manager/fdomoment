'use client';

import React from 'react';
import { ModuleShell } from '../ModuleShell';
import { SearchableSelect } from '../ui/SearchableSelect';
import { ValidatedInput } from '../ui/ValidatedInput';
import {
  DATASET_LICENSES,
  MIME_TYPES,
  getLicenseHint,
  getCommonMimeTypes,
} from '@/lib/momentum/constants';
import { useDataObjectModule } from './useDataObjectModule';
import { DataObjectModuleProps } from './types';

export function DataObjectModule({
  dataobject,
  core,
  updateDataobject,
}: DataObjectModuleProps) {
  const { handleDataUrlChange, handleNext } = useDataObjectModule(dataobject, updateDataobject);

  const isFormValid =
    dataobject.license.length > 0 &&
    dataobject.mimeType.length > 0 &&
    dataobject.dataUrl.length > 0 &&
    dataobject.dataUrlValidated;

  return (
    <ModuleShell title="📊 Data Object Metadata" badge="required">
      <div className="space-y-6">
        <SearchableSelect
          label="License"
          required
          options={DATASET_LICENSES}
          value={dataobject.license || null}
          onChange={(option) => {
            updateDataobject({
              license: option.id,
              licenseUrl: DATASET_LICENSES.find(l => l.id === option.id)?.url || '',
            });
          }}
          placeholder="Choose license..."
          hint={getLicenseHint(core.researchDomain)}
        />

        <SearchableSelect
          label="MIME-Type"
          required
          options={MIME_TYPES}
          value={dataobject.mimeType || null}
          onChange={(option) => {
            updateDataobject({ mimeType: option.id });
          }}
          placeholder="Choose MIME-Type..."
          quickOptions={getCommonMimeTypes(core.researchDomain)}
        />

        <ValidatedInput
          label="Data URL"
          required
          type="url"
          value={dataobject.dataUrl}
          onChange={handleDataUrlChange}
          placeholder="https://..."
          validationState={
            dataobject.dataUrlValidated
              ? 'valid'
              : dataobject.dataUrl.length > 0
              ? 'pending'
              : 'none'
          }
          validationMessage={
            dataobject.dataUrlValidated
              ? dataobject.dataUrlRepository
                ? `✅ Accessible · Detected: ${dataobject.dataUrlRepository}`
                : '✅ Accessible'
              : undefined
          }
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
