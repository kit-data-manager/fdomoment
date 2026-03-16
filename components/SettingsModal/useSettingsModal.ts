import { useState, useEffect } from 'react';
import { TokenEntry, TokenRepositoryType, REPOSITORY_TYPES } from '@/components/SettingsModal/types';

const STORAGE_KEY = 'fdo-editor-access-tokens';

export const useSettingsModal = (onClose?: () => void) => {
    const [activeTab, setActiveTab] = useState<'general' | 'tokens'>('general');
    const [tokens, setTokens] = useState<TokenEntry[]>([]);
    const [tempTokens, setTempTokens] = useState<TokenEntry[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setTokens(JSON.parse(stored));
                } catch (e) {
                    console.error('Error loading tokens from localStorage:', e);
                }
            }
        }
    }, []);

    useEffect(() => {
        setTempTokens(tokens);
    }, []);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tempTokens));
        setTokens(tempTokens);
        if (onClose) {
            onClose();
        }
    };

    const handleCancel = () => {
        setTempTokens(tokens);
        if (onClose) {
            onClose();
        }
    };

    const addToken = () => {
        const usedTypes = tempTokens.map(t => t.repoType);
        const availableTypes = REPOSITORY_TYPES.filter(t => !usedTypes.includes(t));
        if (availableTypes.length > 0) {
            setTempTokens([...tempTokens, { repoType: availableTypes[0], token: '' }]);
        }
    };

    const removeToken = (index: number) => {
        setTempTokens(tempTokens.filter((_, i) => i !== index));
    };

    const handleRepoTypeChange = (index: number, repoType: TokenRepositoryType) => {
        const newTokens = [...tempTokens];
        newTokens[index].repoType = repoType;
        setTempTokens(newTokens);
    };

    const handleTokenValueChange = (index: number, token: string) => {
        const newTokens = [...tempTokens];
        newTokens[index].token = token;
        setTempTokens(newTokens);
    };

    const usedRepoTypes = tempTokens.map(t => t.repoType);
    const availableRepoTypes = REPOSITORY_TYPES.filter(t => !usedRepoTypes.includes(t));

    return {
        activeTab,
        setActiveTab,
        tokens,
        tempTokens,
        setTempTokens,
        handleSave,
        handleCancel,
        addToken,
        removeToken,
        handleRepoTypeChange,
        handleTokenValueChange,
        usedRepoTypes,
        availableRepoTypes,
        REPOSITORY_TYPES
    };
};
