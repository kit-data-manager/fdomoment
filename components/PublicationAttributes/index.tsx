import React, { useState } from 'react';
import { Link, Book, User, Building, Download, Loader2 } from 'lucide-react';
import { PublicationAttributesModuleProps } from './types';
import { usePublicationAttributes } from './usePublicationAttributes';
import {Icon} from "@iconify/react";

const PublicationAttributes = ({ showHelp = false }: PublicationAttributesModuleProps) => {
  const {
    inputs,
    handleInputChange,
    handleCreatorChange,
    updateInputs,
    setInputs
  } = usePublicationAttributes();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    updateInputs(newInputs);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicationTypes = [
    'Article',
    'Book',
    'BookChapter',
    'ConferencePaper',
    'Dataset',
    'Dissertation',
    'Journal',
    'Map',
    'Preprint',
    'Report',
    'Software',
    'Thesis',
    'WorkingPaper',
    'Other'
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
        const newInputs = {
          ...inputs,
          doi: inputs.doi,
          publicationType: metadata.publicationType || inputs.publicationType,
          title: metadata.title || inputs.title,
          publisher: metadata.publisher || inputs.publisher,
          publicationYear: metadata.publicationYear || inputs.publicationYear,
          creator: metadata?.creators ? metadata?.creators[0].orcid : inputs.creator
        };
        setInputs(newInputs);
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
                <Link />
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
                <Book />
                <select
                  name="publicationType"
                  value={inputs.publicationType ?? ''}
                  onChange={handleChange}
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
                <input
                  name="title"
                  value={inputs.title ?? ''}
                  onChange={handleChange}
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
                <Building />
                <input
                  name="publisher"
                  value={inputs.publisher ?? ''}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Publisher name"
                />
              </label>
              <p className="label">The publisher of the publication.</p>
            </fieldset>
          </div>

          <div className="flex items-center gap-2">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <input
                  name="publicationYear"
                  value={inputs.publicationYear ?? ''}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="YYYY"
                  maxLength={4}
                />
              </label>
              <p className="label">The year of publication (e.g., 2024).</p>
            </fieldset>
          </div>

          <div className="flex items-center gap-2">
            <fieldset className="fieldset w-full">
              <label className="input w-full">
                <User />
                <input
                  name="creator"
                  value={inputs.creator ?? ''}
                  onChange={(e) => handleCreatorChange(e.target.value)}
                  className="w-full"
                  placeholder="ORCID or name"
                />
              </label>
              <p className="label">The creator&apos;s ORCID or name (default from Core Attributes).</p>
            </fieldset>
          </div>
        </div>
      )}
    </div>
  );
};

PublicationAttributes.displayName = 'PublicationAttributes';

export default PublicationAttributes;
export { PublicationAttributes };
