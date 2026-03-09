'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";
import { searchORCiD, formatORCiDDisplay, ORCiDResult } from '@/utils/orcid-client';
import { searchROR, formatRORDisplay, RORResult } from '@/utils/ror-client';
import {parseNameAndId} from "@/utils/parse-utils";

export type OwnerIdType = 'ORCiD' | 'ROR';

interface OwnerIdAutocompleteProps {
    value: string;
    displayValue: string;
    idType: OwnerIdType;
    onChange: (value: string) => void;
    onSelect: (id: string, name: string, type: OwnerIdType) => void;
    onTypeChange: (type: OwnerIdType) => void;
}

const OwnerIdAutocomplete: React.FC<OwnerIdAutocompleteProps> = ({
    value,
    displayValue,
    idType,
    onChange,
    onSelect,
    onTypeChange
}) => {
    const [suggestions, setSuggestions] = useState<Array<ORCiDResult | RORResult>>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const effectiveIdType = mounted ? idType : 'ORCiD';
    const datalistId = `ownerIdSuggestions-${effectiveIdType}`;

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (value.length >= 5) {
                let results: Array<ORCiDResult | RORResult> = [];
                
                if (effectiveIdType === 'ORCiD') {
                    results = await searchORCiD(value);
                } else {
                    results = await searchROR(value);
                }
                
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        };
        
        const debounce = setTimeout(() => {
            fetchSuggestions();
        }, 300);
        
        return () => clearTimeout(debounce);
    }, [value, effectiveIdType]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        onChange(inputValue);
        
        const selectedValue = inputValue;
        
        if (effectiveIdType === 'ORCiD') {
            const parsed = parseNameAndId(selectedValue);
            if (parsed) {
                onSelect(parsed.id, parsed.name, 'ORCiD');
                setSuggestions([]);
            }
        } else {
            const parsed = parseNameAndId(selectedValue);
            if (parsed) {
                onSelect(parsed.id, parsed.name, 'ROR');
                setSuggestions([]);
            }
        }
    };

    const handleSelect = (item: ORCiDResult | RORResult) => {
        if (effectiveIdType === 'ORCiD') {
            const orcidItem = item as ORCiDResult;
            const id = orcidItem['orcid-id'];
            const name = `${orcidItem['family-names']}, ${orcidItem['given-names']}`;
            onSelect(id, name, 'ORCiD');
        } else {
            const rorItem = item as RORResult;
            const displayName = rorItem.names.find(
                name => name.types && name.types.includes('ror_display')
            )?.value || rorItem.names[0].value;
            onSelect(rorItem.id, displayName, 'ROR');
        }
        setSuggestions([]);
    };

    const formatDisplay = (item: ORCiDResult | RORResult): string => {
        if (effectiveIdType === 'ORCiD') {
            return formatORCiDDisplay(item as ORCiDResult);
        } else {
            return formatRORDisplay(item as RORResult);
        }
    };

    return (
        <div className="w-full flex items-center gap-2">
            <div className="join">
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
                onChange={handleInput}
                className="input-bordered flex-1"
                list={datalistId}
                placeholder={effectiveIdType === 'ORCiD' ? 'Search ORCiD...' : 'Search ROR...'}
            />
            <datalist id={datalistId}>
                {suggestions.map((item, index) => (
                    <option 
                        key={index} 
                        value={formatDisplay(item)}
                    />
                ))}
            </datalist>
        </div>
    );
};

export default OwnerIdAutocomplete;
