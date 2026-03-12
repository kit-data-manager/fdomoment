'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";
import { X } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const effectiveIdType = mounted ? idType : 'ORCiD';

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length >= 2) {
                let results: Array<ORCiDResult | RORResult> = [];
                
                if (effectiveIdType === 'ORCiD') {
                    results = await searchORCiD(searchTerm);
                } else {
                    results = await searchROR(searchTerm);
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
    }, [searchTerm, effectiveIdType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);
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
            setSearchTerm('');
        } else {
            const rorItem = item as RORResult;
            const displayName = rorItem.names.find(
                name => name.types && name.types.includes('ror_display')
            )?.value || rorItem.names[0].value;
            onSelect(rorItem.id, displayName, 'ROR');
            setSearchTerm('');
        }
        setSuggestions([]);
    };

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
                onChange={handleInputChange}
                className="input flex-1"
                placeholder={effectiveIdType === 'ORCiD' ? 'Search ORCiD...' : 'Search ROR...'}
                list="ownerIdSuggestions"
            />
            {displayValue && (
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        onSelect('', '', effectiveIdType);
                        setSearchTerm('');
                    }}
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
                        onClick={() => handleSelect(item)}
                    />
                ))}
            </datalist>
        </div>
    );
};

export { OwnerIdAutocomplete };
