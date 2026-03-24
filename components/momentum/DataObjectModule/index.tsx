'use client';

import React from 'react';
import { ModuleShell } from '../ModuleShell';
import { SearchableSelect } from '../ui/SearchableSelect';
import { ValidatedInput } from '../ui/ValidatedInput';
import { NavigationButtons } from '../ui/NavigationButtons';
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
  showNext = true,
  showPrev = false,
  onNextModule,
  onPrevModule,
}: DataObjectModuleProps) {
  const { handleDataUrlChange } = useDataObjectModule(dataobject, updateDataobject);

  return (
    <ModuleShell title="🗄️ Data Object Metadata" badge="required">
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

      <NavigationButtons
        showPrev={showPrev}
        showNext={showNext}
        onPrev={onPrevModule}
        onNext={onNextModule}
      />
    </ModuleShell>
  );
}
