import React, {useEffect, useState, forwardRef, useImperativeHandle} from 'react';
import {Building2, Copyright, FileType, Link, TestTubeDiagonal, Users} from "lucide-react";
import MimeTypeAutocomplete from './MimeTypeAutocomplete';
import LicenseAutocomplete from './LicenseAutocomplete';

interface DatasetSectionProps {
  onDataChange: (data: any) => void;
  onSave?: () => void;
}

const DatasetSection = forwardRef<{ save: () => void }, DatasetSectionProps>(({ onDataChange, onSave }, ref) => {
     const [inputs, setInputs] = useState({
         mimeType: '',
         license_id: localStorage.getItem('dataset_license_id') || '',
         license_name: localStorage.getItem('dataset_license_name') || '',
         contentLocation: ''
     });

    // Load saved values from localStorage on component mount
    useEffect(() => {
        const savedLicenseId = localStorage.getItem('dataset_license_id');
        const savedLicenseName = localStorage.getItem('dataset_license_name');

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
        console.log("UP", updatedInputs);
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
        localStorage.setItem('dataset_license_id', inputs.license_id);
        localStorage.setItem('dataset_license_name', inputs.license_name);
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
                    alt="Movie"
                    className="opacity-10 logo border-r-2 border-secondary"/>
                <div
                    className="absolute -top-15 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
              <span
                  className="text-sm">This modules contains dataset kernel attributes to specify a dataset&apos;s type, location, and license.</span>
                    <br/>
                    <span className="text-sm">These are {" "}
                        <Users width={12} height={12} className="inline align-baseline"/> ORCiD and {" "}
                        <Building2 width={12} height={12} className="inline align-baseline"/> affiliation ROR of
                  the creator as well as the <TestTubeDiagonal width={12} height={12}
                                                               className="inline align-baseline"/> research field the FAIR Digital Object is related to.</span>
                </div>
            </figure>
            <div className="card-body">
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <FileType/>
                            <MimeTypeAutocomplete
                                value={inputs.mimeType}
                                displayValue={inputs.mimeType}
                                onChange={(value) => setInputs(prev => ({...prev, mimeType: value}))}
                                onSelect={handleMimetypeSelect}
                            />
                        </label>
                        <p className="label">The associated content&apos;s mime type.</p>
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
                        <p className="label">The associated content&apos;s license.</p>
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
                        <p className="label">The associated content&apos;s URL.</p>
                    </fieldset>
                </div>
            </div>
        </div>
    );
});

DatasetSection.displayName = 'DatasetSection';

export default DatasetSection;
