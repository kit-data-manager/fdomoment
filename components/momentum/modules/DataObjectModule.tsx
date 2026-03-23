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
  dataset: DataObjectMetadata;
  basis: CoreMetadata;
  updateDataset: (partial: Partial<DataObjectMetadata>) => void;
  activatePublication?: () => void;
  setActiveModule?: (module: string) => void;
}

export function DataObjectModule({
  dataset,
  basis,
  updateDataset,
  activatePublication,
  setActiveModule,
}: DatasetModuleProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const triggerUrlValidation = useCallback((url: string) => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const timeout = setTimeout(async () => {
      if (url.length > 0) {
        const result = await validateUrl(url);
        updateDataset({
          dataUrlValidated: result.valid,
          dataUrlRepository: result.repository,
        });
      }
    }, 800);

    setValidationTimeout(timeout);
  }, [validationTimeout, updateDataset]);

  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  const handleDataUrlChange = (value: string) => {
    updateDataset({
      dataUrl: value,
      dataUrlValidated: false,
      dataUrlRepository: null,
    });
    triggerUrlValidation(value);
  };

  const isFormValid =
    dataset.license.length > 0 &&
    dataset.mimeType.length > 0 &&
    dataset.dataUrl.length > 0 &&
    dataset.dataUrlValidated;

  const handleNext = () => {
    if (activatePublication && setActiveModule) {
      setShowSuccess(true);
    }
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

  if (showSuccess) {
    return (
      <ModuleShell title="📊 Data Object Metadata" badge="required">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800 mb-2">
            ✅ Dataset Metadata complete!
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
    <ModuleShell title="📊 Data Object Metadata" badge="required">
      <div className="space-y-6">
        <SearchableSelect
          label="License"
          required
          options={DATASET_LICENSES}
          value={dataset.license || null}
          onChange={(option) => {
            updateDataset({
              license: option.id,
              licenseUrl: DATASET_LICENSES.find(l => l.id === option.id)?.url || '',
            });
          }}
          placeholder="Choose license..."
          hint={getLicenseHint(basis.researchDomain)}
        />

        <SearchableSelect
          label="MIME-Type"
          required
          options={MIME_TYPES}
          value={dataset.mimeType || null}
          onChange={(option) => {
            updateDataset({ mimeType: option.id });
          }}
          placeholder="Choose MIME-Type..."
          quickOptions={getCommonMimeTypes(basis.researchDomain)}
        />

        <ValidatedInput
          label="Data URL"
          required
          type="url"
          value={dataset.dataUrl}
          onChange={handleDataUrlChange}
          placeholder="https://..."
          validationState={
            dataset.dataUrlValidated
              ? 'valid'
              : dataset.dataUrl.length > 0
              ? 'pending'
              : 'none'
          }
          validationMessage={
            dataset.dataUrlValidated
              ? dataset.dataUrlRepository
                ? `✅ Accessible · Detected: ${dataset.dataUrlRepository}`
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
