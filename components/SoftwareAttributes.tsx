import React, {useEffect, useState} from 'react';
import {Copyright, FileQuestionMark, FileType, Link} from "lucide-react";
import {Icon} from '@iconify/react';
import LicenseAutocomplete from './LicenseAutocomplete';
import {getRepositoryInfo, RepositoryType} from '../utils/git-client';
import {searchSPDXLicenses} from "@/utils/license-client";

interface SoftwareModuleProps {
  onDataChange: (data: any) => void;
}

const SoftwareAttributes = ({ onDataChange }: SoftwareModuleProps) => {
    const [inputs, setInputs] = useState({
        repositoryUrl: '',
        softwareLocation: '',
        license_id: '',
        license_name: '',
        readmeLocation: ''
    });
    const [repositoryType, setRepositoryType] = useState<RepositoryType>('GitHub');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        onDataChange(inputs);
    }, []);

    const handleLicenseSelect = (id: string, name: string, url: string) => {
        const newInputs = { ...inputs, license_id: id, license_name: name };
        setInputs(newInputs);
        onDataChange(newInputs);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newInputs = { ...inputs, [name]: value };
      setInputs(newInputs);
      onDataChange(newInputs);
    };

    const handleAutoDetect = async () => {
        if (!inputs.softwareLocation) return;
        
        setShowError(false);
        setIsLoading(true);
        
        try {
            const info = await getRepositoryInfo(inputs.softwareLocation);
            
            if (info.repositoryType) {
                setRepositoryType(info.repositoryType);
            }

            let newInputs = {...inputs};

            if (info.license) {
               await searchSPDXLicenses(info.license).then(license => {
                    if(license.length > 0){
                    newInputs = {
                        ...newInputs,
                        license_id: license[0].id,
                        license_name: license[0].name
                    };
                    }
                });
            }

            if (info.readmeUrl) {
                newInputs = {
                    ...newInputs,
                    readmeLocation: info.readmeUrl
                };
            }
            setInputs(newInputs);
            onDataChange(newInputs);
        } catch (error) {
            console.error('Error fetching repository info:', error);
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card card-side bg-base-100 shadow-sm">
            <figure className="relative w-72 h-full">
                <img
                    src="./software_background.png"
                    alt="Movie"
                    className="opacity-10 logo border-r-2 border-secondary"/>
                <div
                    className="absolute -top-12 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
                <span className="text-sm">
                        This module contributes software-related attributes to the FAIR Digital Object. In contrast to a digital object,
                        software is defined as code or binary to execute specific tasks. When associated with another FDO, it may
                    facilitate <span className="text-info">reproducibility</span> and <span className="text-info">reusability</span>.
                        <br/><br/>
                        <span className="text-info">Digital Object Module</span> and <span className="text-info">Software Module</span> are <span className="text-info">exclusive</span> {" "}
                        and can not be used together.
                    </span>
                </div>
            </figure>
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
                                className="w-full"
                                value={repositoryType}
                                onChange={(e) => setRepositoryType(e.target.value as RepositoryType)}
                            >
                                <option value="GitHub" className="text-neutral">GitHub</option>
                                <option value="GitLab.com" className="text-neutral">GitLab.com</option>
                                <option value="Codebase@Helmholtz" className="text-neutral">Codebase@Helmholtz</option>
                                <option value="GitLab@KIT" className="text-neutral">GitLab@KIT</option>
                                <option value="Other" className="text-neutral">Other</option>
                            </select>
                        </label>
                        <p className="label">The detected Git platform.</p>
                    </fieldset>
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <Copyright/>
                             <LicenseAutocomplete
                                 value={inputs.license_id}
                                 displayValue={inputs.license_name ? `${inputs.license_name} (${inputs.license_id})` : ''}
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
        </div>
    );
};

SoftwareAttributes.displayName = 'SoftwareAttributes';

export default SoftwareAttributes;
