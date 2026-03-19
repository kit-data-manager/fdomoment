'use client';

import React, { useId } from 'react';
import { Icon } from "@iconify/react";
import { X } from 'lucide-react';
import { ORCiDResult, formatORCiDDisplay } from '@/utils/orcid-client';
import { RORResult, formatRORDisplay } from '@/utils/ror-client';
import { OwnerIdAutocompleteProps } from './types';
import { useOwnerIdAutocomplete } from './useOwnerIdAutocomplete';

const OwnerIdAutocomplete: React.FC<OwnerIdAutocompleteProps> = ({
    value,
    displayValue,
    idType,
    fixedType,
    onChange,
    onSelect,
    onTypeChange
}) => {
    const datalistId = useId();
    const {
        suggestions,
        effectiveIdType,
        handleInputChange,
        handleSelect,
        clearSelection
    } = useOwnerIdAutocomplete(idType, fixedType);

    const showToggle = !fixedType;
    const displayIcon = fixedType || effectiveIdType;

    return (
        <div className="w-full flex items-center gap-2">
            {showToggle && (
                <div className="join shrink-0">
                    <button
                        type="button"
                        className={`join-item btn btn-sm ${effectiveIdType === 'ORCiD' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => onTypeChange('ORCiD')}
                        title="ORCiD"
                    >
                        <Icon icon="academicons:orcid" width={16} />
                    </button>
                    <button
                        type="button"
                        className={`join-item btn btn-sm ${effectiveIdType === 'ROR' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => onTypeChange('ROR')}
                        title="ROR"
                    >
                        <Icon icon="academicons:ror" width={16} />
                    </button>
                </div>
            )}
            {showToggle ? (
                <input
                    type="text"
                    value={displayValue || value}
                    onChange={(e) => handleInputChange(e.target.value, onChange, onSelect)}
                    className="input flex-1"
                    placeholder={effectiveIdType === 'ORCiD' ? 'Search ORCiD...' : 'Search ROR...'}
                    list={datalistId}
                />
            ) : (
                <fieldset className="fieldset w-full">
                    <label className="input w-full">
                        <Icon
                            icon={displayIcon === 'ORCiD' ? 'academicons:orcid' : 'academicons:ror'}
                            className="text-xl"
                        />
                        <input
                            type="text"
                            value={displayValue || value}
                            onChange={(e) => handleInputChange(e.target.value, onChange, onSelect)}
                            className="input flex-1"
                            placeholder={effectiveIdType === 'ORCiD' ? 'Search ORCiD...' : 'Search ROR...'}
                            list={datalistId}
                        />
                        </label>
                </fieldset>
                )}
            {displayValue && (
                        <button
                            type="button"
                            onClick={() => clearSelection(onChange, onSelect)}
                            className="btn btn-ghost btn-sm"
                            title="Clear selection"
                        >
                            <X className="w-4 h-4"/>
                        </button>
                    )}
                    <datalist id={datalistId}>
                        {suggestions.map((item, index) => {
                            const isORCiD = 'orcid-id' in item;
                            return (
                                <option
                                    key={index}
                                    value={isORCiD ? formatORCiDDisplay(item as ORCiDResult) : formatRORDisplay(item as RORResult)}
                                    onClick={() => handleSelect(item, onSelect)}
                                />
                            );
                        })}
                    </datalist>
                </div>
            );
        };

export {OwnerIdAutocomplete};
export type {OwnerIdType} from './types';
