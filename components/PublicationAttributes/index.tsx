'use client';

import React, { useState } from 'react';
import { Link, Book } from 'lucide-react';
import { PublicationAttributesModuleProps } from './types';
import { usePublicationAttributes } from './usePublicationAttributes';
import { Icon } from "@iconify/react";
import { OwnerIdAutocomplete } from '@/components/OwnerIdAutocomplete';

const PublicationAttributes = ({ showHelp = false }: PublicationAttributesModuleProps) => {
  const {
    inputs,
    handleInputChange,
    handleAddCreator,
    handleRemoveCreator,
    handleCreatorChange,
    handleCreatorSelect,
    handleSetCreatorsFromMetadata,
    updateInputs
  } = usePublicationAttributes();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicationTypes = [
    'audiovisual',
    'award',
    'book',
    'bookchapter',
    'collection',
    'computationalnotebook',
    'conferencepaper',
    'conferenceproceeding',
    'datapaper',
    'dataset',
    'dissertation',
    'event',
    'image',
    'interactiveresource',
    'instrument',
    'journal',
    'journalarticle',
    'model',
    'outputmanagementplan',
    'peerreview',
    'physicalobject',
    'poster',
    'preprint',
    'presentation',
    'project',
    'report',
    'service',
    'software',
    'sound',
    'standard',
    'studyregistration',
    'text',
    'workflow',
    'other'
  ];

  const handleResolveDoi = async () => {
    if (!inputs.doi) {
      setError('Please enter a DOI first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/resolve-doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doiInput: inputs.doi })
      });

      const result = await response.json();

      if (result.success && result.metadata) {
        const { metadata } = result;

        const publicationType = metadata.publicationType && publicationTypes.includes(metadata.publicationType)
          ? metadata.publicationType
          : 'other';

        const newInputs = {
          ...inputs,
          doi: inputs.doi,
          publicationType: publicationType,
          title: metadata.title || inputs.title,
          publicationYear: metadata.publicationYear || inputs.publicationYear
        };

        if (metadata.creators && metadata.creators.length > 0) {
          handleSetCreatorsFromMetadata(metadata.creators);
        } else {
          updateInputs(newInputs);
        }
      } else {
        setError(result.error || 'Failed to resolve DOI');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      {showHelp ? (
        <div className="card-body">
          <figure className="relative w-full h-64">
            <img
              src="./publication_background.png"
              alt="PublicationAttributesBackground"
              className="opacity-10 logo w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-secondary p-4">
              <span className="text-base">
                This module contributes publication-related attributes to the FAIR Digital Object. It allows describing
                scholarly publications with their DOI, type, title, publisher, and publication year.
                <br/><br/>
                These attributes facilitate <span className="text-info">findability</span> and proper attribution of
                research outputs.
              </span>
            </div>
          </figure>
        </div>
      ) : (
        <div className="card-body">
          <div className="flex items-center gap-2">
            <fieldset className="fieldset w-full">
              <label className="input w-full flex-1">
                <Icon icon="simple-icons:doi" className="text-xl" />
                <input
                  name="doi"
                  value={inputs.doi ?? ''}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="e.g., 10.1000/xyz123 or https://doi.org/..."
                />
              </label>
              <p className="label">The Digital Object Identifier (DOI) of the publication.</p>
            </fieldset>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleResolveDoi}
                disabled={loading}
                className={`btn btn-ghost -mt-6 justify-self-end ${loading ? 'loading' : ''}`}
                title={loading ? 'Resolving DOI...' : 'Resolve DOI'}
              >
                <Icon icon="ic:outline-auto-fix-high" className="text-xl" />
              </button>
            </div>
          </div>
          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <Icon icon="mdi:category-outline" className="text-xl" />
                <select
                  name="publicationType"
                  value={inputs.publicationType ?? ''}
                  onChange={handleInputChange}
                  className="select select-ghost w-full"
                >
                  <option value="">Select publication type</option>
                  {publicationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <p className="label">The type of the publication.</p>
            </fieldset>
          </div>

          <div className="flex items-center gap-2">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <Icon icon="material-symbols:title-rounded" className="text-xl" />
                <input
                  name="title"
                  value={inputs.title ?? ''}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Publication title"
                />
              </label>
              <p className="label">The title of the publication.</p>
            </fieldset>
          </div>

          <div className="flex items-center gap-2">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <Icon icon="ep:calendar" className="text-xl" />
                <input
                  name="publicationYear"
                  value={inputs.publicationYear ?? ''}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="YYYY"
                  maxLength={4}
                />
              </label>
              <p className="label">The year of publication (e.g., 2024).</p>
            </fieldset>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
              <label className="label">
                <span className="label-text">Creators</span>
              </label>
              <button
                type="button"
                onClick={handleAddCreator}
                className="btn btn-sm btn-ghost"
                title="Add creator"
              >
                <Icon icon="ic:outline-add" className="text-xl" />
              </button>
            </div>
            
            {inputs.creators.map((creator, index) => (
              <div key={index} className="flex items-center gap-2">
                <OwnerIdAutocomplete
                  value={creator.id || ''}
                  displayValue={creator.name || ''}
                  idType="ORCiD"
                  fixedType="ORCiD"
                  onChange={(value) => handleCreatorChange(index, 'id', value)}
                  onSelect={(id, name) => handleCreatorSelect(index, id, name)}
                  onTypeChange={() => {}}
                />
                {inputs.creators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCreator(index)}
                    className="btn btn-ghost btn-sm"
                    title="Remove creator"
                  >
                    <Icon icon="ic:outline-remove" className="text-xl" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

PublicationAttributes.displayName = 'PublicationAttributes';

export default PublicationAttributes;
export { PublicationAttributes };
