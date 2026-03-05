'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STORAGE_KEY = 'fdo-editor-access-tokens';

interface AccessTokens {
    GitHub?: string;
    GitLab?: string;
    Other?: string;
}

type TokenKey = 'GitHub' | 'GitLab' | 'Other';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'tokens'>('general');
    const [tokens, setTokens] = useState<AccessTokens>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        }
        return {};
    });
    const [tempTokens, setTempTokens] = useState<AccessTokens>(tokens);

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

    const handleTokenChange = (type: TokenKey, value: string) => {
        setTempTokens(prev => ({ ...prev, [type]: value }));
    };

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
                        <fieldset className="fieldset w-full">
                            <label className="fieldset-label">GitHub Personal Access Token</label>
                            <input 
                                type="password" 
                                className="input w-full" 
                                placeholder="ghp_xxxxxxxxxxxx"
                                value={tempTokens.GitHub || ''}
                                onChange={(e) => handleTokenChange('GitHub', e.target.value)}
                            />
                        </fieldset>
                        <fieldset className="fieldset w-full">
                            <label className="fieldset-label">GitLab Personal Access Token</label>
                            <input 
                                type="password" 
                                className="input w-full" 
                                placeholder="glpat-xxxxxxxxxxxx"
                                value={tempTokens.GitLab || ''}
                                onChange={(e) => handleTokenChange('GitLab', e.target.value)}
                            />
                        </fieldset>
                        <fieldset className="fieldset w-full">
                            <label className="fieldset-label">Other Repository Token</label>
                            <input 
                                type="password" 
                                className="input w-full" 
                                placeholder="Token for other repositories"
                                value={tempTokens.Other || ''}
                                onChange={(e) => handleTokenChange('Other', e.target.value)}
                            />
                        </fieldset>
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
