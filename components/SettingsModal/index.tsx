'use client';

import { Icon } from "@iconify/react";
import { useSettingsModal } from '@/components/SettingsModal/useSettingsModal';
import { SearchableSelect } from '@/components/momentum/ui/SearchableSelect';
import { ValidatedInput } from '@/components/momentum/ui/ValidatedInput';
import { TokenRepositoryType } from '@/components/SettingsModal/types';

export const SettingsModal = function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const settingsModal = useSettingsModal(onClose);
    
    if (!settingsModal || settingsModal.isLoading) return null;
    
    const {
        tempSettings,
        tempTokens,
        activeTab,
        setActiveTab,
        handleOrcidChange,
        handleResearchDomainChange,
        handleThemeChange,
        handleSave,
        handleCancel,
        addToken,
        removeToken,
        handleRepoTypeChange,
        handleTokenValueChange,
        availableRepoTypes,
        REPOSITORY_TYPES,
        RESEARCH_DOMAINS,
    } = settingsModal;

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
                            <label className="label">
                                <span className="label-text font-medium">My ORCiD</span>
                            </label>
                            <ValidatedInput
                                label=""
                                required={false}
                                value={tempSettings.orcid}
                                onChange={handleOrcidChange}
                                placeholder="0000-0000-0000-0000"
                                validationState={
                                    tempSettings.orcidValidated
                                        ? 'valid'
                                        : tempSettings.orcid.length > 0
                                        ? 'pending'
                                        : 'none'
                                }
                                validationMessage={
                                    tempSettings.orcidValidated
                                        ? `✅ Verified (${tempSettings.orcidName || 'Unknown'})`
                                        : tempSettings.orcid.length === 19 && !tempSettings.orcidValidated
                                        ? 'Validating...'
                                        : undefined
                                }
                            />
                        </fieldset>

                        <fieldset className="fieldset w-full">
                            <label className="label">
                                <span className="label-text font-medium">My Research Domain</span>
                            </label>
                            <SearchableSelect
                                label=""
                                required={false}
                                options={RESEARCH_DOMAINS}
                                value={tempSettings.researchDomain}
                                onChange={(option) => {
                                    handleResearchDomainChange(option?.id || null);
                                }}
                                placeholder="Select your research domain..."
                            />
                        </fieldset>

                        <fieldset className="fieldset w-full">
                            <label className="label">
                                <span className="label-text font-medium">Theme</span>
                            </label>
                            <select
                                className="select w-full"
                                value={tempSettings.theme}
                                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
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
