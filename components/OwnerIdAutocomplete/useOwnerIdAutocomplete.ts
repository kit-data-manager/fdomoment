'use client';

import { useState, useEffect } from 'react';
import { ORCiDResult, searchORCiD } from '@/utils/orcid-client';
import { RORResult, searchROR } from '@/utils/ror-client';
import { parseNameAndId } from '@/utils/parse-utils';
import { OwnerIdType } from '@/components/OwnerIdAutocomplete/types';

export const useOwnerIdAutocomplete = (idType: OwnerIdType, fixedType?: OwnerIdType) => {
    const [suggestions, setSuggestions] = useState<Array<ORCiDResult | RORResult>>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setSuggestions([]);
        setSearchTerm('');
    }, [idType]);

    const effectiveIdType: OwnerIdType = mounted ? (fixedType || idType) : 'ORCiD';

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

    const handleInputChange = (
        inputValue: string,
        onChange: (value: string) => void,
        onSelect: (id: string, name: string, type: OwnerIdType) => void
    ) => {
        setSearchTerm(inputValue);
        onChange(inputValue);
        
        if (effectiveIdType === 'ORCiD') {
            const parsed = parseNameAndId(inputValue);
            if (parsed) {
                onSelect(parsed.id, parsed.name, 'ORCiD');
                setSuggestions([]);
            }
        } else {
            const parsed = parseNameAndId(inputValue);
            if (parsed) {
                onSelect(parsed.id, parsed.name, 'ROR');
                setSuggestions([]);
            }
        }
    };

    const handleSelect = (
        item: ORCiDResult | RORResult,
        onSelect: (id: string, name: string, type: OwnerIdType) => void
    ) => {
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

    const clearSelection = (
        onChange: (value: string) => void,
        onSelect: (id: string, name: string, type: OwnerIdType) => void
    ) => {
        onChange('');
        onSelect('', '', effectiveIdType);
        setSearchTerm('');
    };

    return {
        suggestions,
        searchTerm,
        setSearchTerm,
        mounted,
        effectiveIdType,
        handleInputChange,
        handleSelect,
        clearSelection
    };
};
