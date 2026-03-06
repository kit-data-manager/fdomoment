'use client';

import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STORAGE_KEY = 'fdo-editor-access-tokens';

export type TokenRepositoryType = 'GitHub' | 'GitLab.com' | 'Codebase@Helmholtz' | 'GitLab@Kit';

const REPOSITORY_TYPES: TokenRepositoryType[] = ['GitHub', 'GitLab.com', 'Codebase@Helmholtz', 'GitLab@Kit'];

interface TokenEntry {
    repoType: TokenRepositoryType;
    token: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'tokens'>('general');
    const [tokens, setTokens] = useState<TokenEntry[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        }
        return [];
    });
    const [tempTokens, setTempTokens] = useState<TokenEntry[]>(tokens);

    useEffect(() => {
        setTempTokens(tokens);
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tempTokens));
        setTokens(tempTokens);
        onClose();
    };

    const handleCancel = () => {
        setTempTokens(tokens);
        onClose();
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

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Settings</h3>
                
                <div className="tabs tabs-boxed mb-4">
                    <button 
                        className={`tab ${activeTab === 'general' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button 
                        className={`tab ${activeTab === 'tokens' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('tokens')}
                    >
                        Access Tokens
                    </button>
                </div>

                {activeTab === 'general' && (
                    <div className="space-y-4">
                        <fieldset className="fieldset w-full">
                            <label className="fieldset-label">Application Name</label>
                            <input type="text" className="input w-full" placeholder="FDO Editor" />
                        </fieldset>
                        <fieldset className="fieldset w-full">
                            <label className="fieldset-label">Theme</label>
                            <select className="select w-full">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>System</option>
                            </select>
                        </fieldset>
                        <fieldset className="fieldset w-full">
                            <label className="fieldset-label">Auto-save Interval (seconds)</label>
                            <input type="number" className="input w-full" placeholder="30" />
                        </fieldset>
                    </div>
                )}

                {activeTab === 'tokens' && (
                    <div className="space-y-4">
                        <p className="text-sm text-base-content/70 mb-4">
                            Provide access tokens for private repositories. These tokens will be used when fetching repository information.
                        </p>
                        {tempTokens.map((entry, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <fieldset className="fieldset w-48">
                                    <select
                                        className="select w-full"
                                        value={entry.repoType}
                                        onChange={(e) => handleRepoTypeChange(index, e.target.value as TokenRepositoryType)}
                                    >
                                        {REPOSITORY_TYPES.map(type => (
                                            <option key={type} value={type} disabled={tempTokens.some((t, i) => i !== index && t.repoType === type)}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                <fieldset className="fieldset flex-1">
                                    <input 
                                        type="password" 
                                        className="input w-full" 
                                        placeholder="Access token"
                                        value={entry.token}
                                        onChange={(e) => handleTokenValueChange(index, e.target.value)}
                                    />
                                </fieldset>
                                <button
                                    onClick={() => removeToken(index)}
                                    className="btn btn-ghost mt-1"
                                >
                                    <Icon icon="mdi:delete" width="20" height="20" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addToken}
                            disabled={availableRepoTypes.length === 0}
                            className="btn btn-soft btn-info btn-sm w-full"
                        >
                            Add Access Token
                        </button>
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleCancel}>close</button>
            </form>
        </dialog>
    );
}
