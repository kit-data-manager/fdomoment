'use client';

import React from 'react';
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
    onChange,
    onSelect,
    onTypeChange
}) => {
    const {
        suggestions,
        effectiveIdType,
        handleInputChange,
        handleSelect,
        clearSelection
    } = useOwnerIdAutocomplete(idType);

    return (
        <div className="w-full flex items-center gap-2">
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
            <input
                type="text"
                value={displayValue || value}
                onChange={(e) => handleInputChange(e.target.value, onChange, onSelect)}
                className="input flex-1"
                placeholder={effectiveIdType === 'ORCiD' ? 'Search ORCiD...' : 'Search ROR...'}
                list="ownerIdSuggestions"
            />
            {displayValue && (
                <button
                    type="button"
                    onClick={() => clearSelection(onChange, onSelect)}
                    className="btn btn-ghost btn-sm"
                    title="Clear selection"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            <datalist id="ownerIdSuggestions">
                {suggestions.map((item, index) => (
                    <option 
                        key={index} 
                        value={effectiveIdType === 'ORCiD' ? formatORCiDDisplay(item as ORCiDResult) : formatRORDisplay(item as RORResult)}
                        onClick={() => handleSelect(item, onSelect)}
                    />
                ))}
            </datalist>
        </div>
    );
};

export { OwnerIdAutocomplete };
export type { OwnerIdType } from './types';
