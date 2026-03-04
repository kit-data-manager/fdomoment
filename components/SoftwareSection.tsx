import React, {useEffect, useState, forwardRef} from 'react';
import {Copyright, FileType, Link} from "lucide-react";
import LicenseAutocomplete from './LicenseAutocomplete';

interface SoftwareSectionProps {
  onDataChange: (data: any) => void;
}

const SoftwareSection = forwardRef<{ save: () => void }, SoftwareSectionProps>(({ onDataChange }, ref) => {
    const [inputs, setInputs] = useState({
        repositoryUrl: '',
        softwareLocation: '',
        license_id: '',
        license_name: '',
        readmeLocation: ''
    });

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

    return (
        <div className="card card-side bg-base-100 shadow-sm">
            <figure className="relative w-72 h-full">
                <img
                    src="./dataset_background.png"
                    alt="Movie"
                    className="opacity-10 logo border-r-2 border-secondary"/>
                <div
                    className="absolute -top-15 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
              <span
                  className="text-sm">This modules contains software kernel attributes to specify software repository location, license and readme.</span>
                </div>
            </figure>
            <div className="card-body">
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <Link/>
                            <input
                                name="repositoryUrl"
                                value={inputs.repositoryUrl}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </label>
                        <p className="label">Repository URL.</p>
                    </fieldset>
                </div>
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <FileType/>
                            <input
                                name="softwareLocation"
                                value={inputs.softwareLocation}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </label>
                        <p className="label">Software Location.</p>
                    </fieldset>
                </div>
                <div className="flex items-center gap-2">
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
                        <p className="label">License.</p>
                    </fieldset>
                </div>
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <Link/>
                            <input
                                name="readmeLocation"
                                value={inputs.readmeLocation}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </label>
                        <p className="label">Readme Location.</p>
                    </fieldset>
                </div>
            </div>
        </div>
    );
});

SoftwareSection.displayName = 'SoftwareSection';

export default SoftwareSection;
