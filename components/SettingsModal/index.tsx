'use client';

import { Icon } from "@iconify/react";
import { useSettingsModal } from '@/components/SettingsModal/useSettingsModal';
import { SearchableSelect } from '@/components/momentum/ui/SearchableSelect';
import { ValidatedInput } from '@/components/momentum/ui/ValidatedInput';

export const SettingsModal = function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const settingsModal = useSettingsModal(onClose);
    
    const {
        tempSettings,
        handleOrcidChange,
        handleResearchDomainChange,
        handleThemeChange,
        handleSave,
        handleCancel,
        RESEARCH_DOMAINS,
        isLoading,
    } = settingsModal;

    if (!isOpen || isLoading) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Settings</h3>
                
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
