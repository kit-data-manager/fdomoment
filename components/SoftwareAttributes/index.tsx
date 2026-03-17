import React from 'react';
import {Copyright, FileQuestionMark,  Link} from "lucide-react";
import {Icon} from '@iconify/react';
import {RepositoryType} from '@/utils/git-client';
import {LicenseAutocomplete} from "@/components/LicenseAutocomplete";
import {SoftwareModuleProps} from "@/components/SoftwareAttributes/types";
import {useSoftwareAttributes} from "@/components/SoftwareAttributes/useSoftwareAttributes";

const SoftwareAttributes = ({ showHelp = false }: SoftwareModuleProps) => {
    const {
        inputs,
        setInputs,
        repositoryType,
        setRepositoryType,
        showError,
        isLoading,
        handleLicenseSelect,
        handleInputChange,
        handleAutoDetect
    } = useSoftwareAttributes();

    return (
        <div className="card bg-base-100 shadow-sm">
            {showHelp ? (
                <div className="card-body">
                    <figure className="relative w-full h-64">
                        <img
                            src="./software_background.png"
                            alt="Movie"
                            className="opacity-10 logo w-full h-full object-contain"/>
                        <div
                            className="absolute inset-0 flex flex-col justify-center items-center text-secondary p-4">
                        <span className="text-base">
                                This module contributes software-related attributes to the FAIR Digital Object. In contrast to a digital object,
                                software is defined as code or binary to execute specific tasks. When associated with another FDO, it may
                            facilitate <span className="text-info">reproducibility</span> and <span className="text-info">reusability</span>.
                                <br/><br/>
                                <span className="text-info">Digital Object Module</span> and <span className="text-info">Software Module</span> are <span className="text-info">exclusive</span> {" "}
                                and can not be used together.
                            </span>
                        </div>
                    </figure>
                </div>
            ) : (
                <div className="card-body">
                    <div className="flex items-center gap-2">
                        <fieldset className="fieldset w-full">
                            <label className="input w-full">
                                <Link/>
                                <input
                                    name="softwareLocation"
                                    value={inputs.softwareLocation}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                            </label>
                            <p className="label">The URL of the software, preferably a release.</p>
                        </fieldset>
                        <button
                            className={`btn btn-ghost -mt-6 justify-self-end ${isLoading ? 'loading' : ''}`}
                            onClick={handleAutoDetect}
                            disabled={isLoading || !inputs.softwareLocation}
                            title="Auto-detect repository info"
                        >
                            <Icon icon="ic:outline-auto-fix-high" className="text-xl" />
                        </button>
                    </div>
                    {showError && (
                        <div className="alert alert-error">
                            <span>Failed to process repository URL. Please check the URL and try again.</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <fieldset className="fieldset w-full">
                            <label className="input w-full">
                                <Icon icon={"fa7-brands:git"} width={24} />
                                <select
                                    className="w-full select select-ghost"
                                    value={repositoryType}
                                    onChange={(e) => setRepositoryType(e.target.value as RepositoryType)}
                                >
                                    <option value="GitHub" >GitHub</option>
                                    <option value="GitLab.com">GitLab.com</option>
                                    <option value="Codebase@Helmholtz" >Codebase@Helmholtz</option>
                                    <option value="GitLab@KIT">GitLab@KIT</option>
                                    <option value="Other" >Other</option>
                                </select>
                            </label>
                            <p className="label">The detected Git platform.</p>
                        </fieldset>
                        <fieldset className="fieldset w-full">
                            <label className="input w-full">
                                <Copyright/>
                                 <LicenseAutocomplete
                                     value={inputs.license_id ?? ''}
                                     onChange={(value) => {
                                         if (value && value.includes(' (')) {
                                             const parts = value.split(' (');
                                             const name = parts[0];
                                             const id = parts[1].replace(')', '');
                                             setInputs(prev => ({
                                                 ...prev,
                                                 license_id: id,
                                                 license_name: name,
                                             }));
                                         } else {
                                             setInputs(prev => ({
                                                 ...prev,
                                                 license_id: value,
                                                 license_name: '',
                                             }));
                                         }
                                     }}
                                     onSelect={handleLicenseSelect}
                                 />
                            </label>
                            <p className="label">The software license obtained from the LICENSE file.</p>
                        </fieldset>
                    </div>
                    <div className="flex items-center gap-2">
                        <fieldset className="fieldset w-full">
                            <label className="input w-full">
                                <FileQuestionMark/>
                                <input
                                    name="readmeLocation"
                                    value={inputs.readmeLocation}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                            </label>
                            <p className="label">The location of README.md</p>
                        </fieldset>
                    </div>
                </div>
            )}
        </div>
    );
};

SoftwareAttributes.displayName = 'SoftwareAttributes';


export { SoftwareAttributes };
export default SoftwareAttributes;
