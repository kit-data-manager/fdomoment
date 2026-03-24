'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataObjectMetadata, CoreMetadata } from '@/lib/momentum/types';
import { ModuleShell } from './ModuleShell';
import { SearchableSelect } from '../ui/SearchableSelect';
import { ValidatedInput } from '../ui/ValidatedInput';
import {
  DATASET_LICENSES,
  MIME_TYPES,
  getLicenseHint,
  getCommonMimeTypes,
} from '@/lib/momentum/constants';
import { validateUrl } from '@/lib/momentum/validation';

interface DatasetModuleProps {
  dataobject: DataObjectMetadata;
  core: CoreMetadata;
  updateDataobject: (partial: Partial<DataObjectMetadata>) => void;
  activatePublication?: () => void;
  setActiveModule?: (module: string) => void;
}

export function DataObjectModule({
  dataobject,
  core,
  updateDataobject,
  activatePublication,
  setActiveModule,
}: DatasetModuleProps) {
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const triggerUrlValidation = useCallback((url: string) => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const timeout = setTimeout(async () => {
      if (url.length > 0) {
        const result = await validateUrl(url);
        updateDataobject({
          dataUrlValidated: result.valid,
          dataUrlRepository: result.repository,
        });
      }
    }, 800);

    setValidationTimeout(timeout);
  }, [validationTimeout, updateDataobject]);

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const handleDataUrlChange = (value: string) => {
    updateDataobject({
      dataUrl: value,
      dataUrlValidated: false,
      dataUrlRepository: null,
    });
    triggerUrlValidation(value);
  };

  const isFormValid =
    dataobject.license.length > 0 &&
    dataobject.mimeType.length > 0 &&
    dataobject.dataUrl.length > 0 &&
    dataobject.dataUrlValidated;

  const handleNext = () => {
    //todo: got to next module according to template
  };

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
