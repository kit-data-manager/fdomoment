import React, {useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {Copyright, FileType, Link} from "lucide-react";
import MimeTypeAutocomplete from './MimeTypeAutocomplete';
import LicenseAutocomplete from './LicenseAutocomplete';

export interface DigitalObjectModuleData {
    mimeType?:string;
    license_id?: string;
    license_name?: string;
    contentLocation?: string;
}

interface DigitalObjectModuleProps {
  onDataChange: (data: DigitalObjectModuleData) => void;
  onSave?: () => void;
}

const DigitalObjectAttributes = forwardRef<{ save: () => void }, DigitalObjectModuleProps>(({ onDataChange, onSave }, ref) => {
     const [inputs, setInputs] = useState<DigitalObjectModuleData>({
         mimeType: '',
         license_id: localStorage.getItem('digital_object_license_id') || '',
         license_name: localStorage.getItem('digital_object_license_name') || '',
         contentLocation: ''
     });

    // Load saved values from localStorage on component mount
    useEffect(() => {
        const savedLicenseId = localStorage.getItem('digital_object_license_id');
        const savedLicenseName = localStorage.getItem('digital_object_license_name');

        let updatedInputs = {
            mimeType: '',
            license_id: savedLicenseId || '',
            license_name: savedLicenseName || '',
            contentLocation: ''
        };
        // Set individual values
        if (savedLicenseId || savedLicenseName) {
            if (savedLicenseId && savedLicenseId.includes(' (')) {
                const parts = savedLicenseId.split(' (');
                if (parts.length === 2) {
                    const id = parts[1].replace(')', '').trim();
                    const name = parts[0].trim();
                    updatedInputs = {
                        ...updatedInputs,
                        license_id: id,
                        license_name: name
                    };
                }
            }
        }
        onDataChange(updatedInputs);
    }, []);

    const handleMimetypeSelect = (value: string) => {
        const newInputs = { ...inputs, mimeType: value};
        setInputs(newInputs);
        onDataChange(newInputs);
    };

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

    const save = () => {
        localStorage.setItem('digitalobject_license_id', inputs.license_id ?? '');
        localStorage.setItem('digitalobject_license_name', inputs.license_name ?? '');
        onSave?.();
    }

    useImperativeHandle(ref, () => ({
        save
    }));

    return (
        <div className="card card-side bg-base-100 shadow-sm">
            <figure className="relative w-72 h-full">
                <img
                    src="./dataset_background.png"
                    alt="DigitalObjectBackground"
                    className="opacity-10 logo border-r-2 border-secondary"/>
                <div className="absolute left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
                    <span className="text-sm">
                        This modules contributes digital object-related attributes to the FAIR Digital Object. A digital object can be
                        for example a dataset, a single file, but also a (metadata) document, schema, and even a stream. The contained
                        attributes are mainly used to facilitate <span className="text-info">accessibility</span>.
                        <br/><br/>
                        <span className="text-info">Digital Object Module</span> and <span className="text-info">Software Module</span> are <span className="text-info">exclusive</span> {" "}
                        and can not be used together.
                        <br/><br/>
                        For documents, primarily consumed by humans, i.e., articles, instructions, or protocols, the {" "}
                        <span className="text-info">Document Module</span> can be added for extended {" "}
                        <span className="text-info">findability</span>.
                    </span>
                </div>
            </figure>
            <div className="card-body">
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <FileType/>
                            <MimeTypeAutocomplete
                                value={inputs.mimeType ?? ''}
                                displayValue={inputs.mimeType ?? ''}
                                onChange={(value) => setInputs(prev => ({...prev, mimeType: value}))}
                                onSelect={handleMimetypeSelect}
                            />
                        </label>
                        <p className="label">The mime type of the digital object.</p>
                    </fieldset>
                </div>
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <Copyright/>
                             <LicenseAutocomplete
                                 value={inputs.license_id ?? ''}
                                 displayValue={inputs.license_name ? `${inputs.license_name} (${inputs.license_id})` : ''}
                                 onChange={(value) => {
                                     // Parse the value to extract name and ID if it's in format "name (id)"
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
                        <p className="label">The license under which the digital object is published.</p>
                    </fieldset>
                </div>
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <Link/>
                            <input
                                name="contentLocation"
                                value={inputs.contentLocation}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </label>
                        <p className="label">The digital object&ampos;s URL, preferably directly accessible via HTTP.</p>
                    </fieldset>
                </div>
            </div>
        </div>
    );
});

DigitalObjectAttributes.displayName = 'DigitalObjectAttributes';

export default DigitalObjectAttributes;
