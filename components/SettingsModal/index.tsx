'use client';

import { Icon } from "@iconify/react";
import { SettingsModalProps, TokenRepositoryType } from '@/components/SettingsModal/types';
import { useSettingsModal } from '@/components/SettingsModal/useSettingsModal';

export const SettingsModal = function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const {
        activeTab,
        setActiveTab,
        tempTokens,
        handleSave,
        handleCancel,
        addToken,
        removeToken,
        handleRepoTypeChange,
        handleTokenValueChange,
        availableRepoTypes,
        REPOSITORY_TYPES
    } = useSettingsModal(onClose);

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

export default SettingsModal;
