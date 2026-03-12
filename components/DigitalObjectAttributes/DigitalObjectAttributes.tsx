import React, {useEffect, useState} from 'react';
import {Copyright, FileType, Link} from "lucide-react";
import MimeTypeAutocomplete from "@/components/MimeTypeAutocomplete";
import LicenseAutocomplete from "@/components/LicenseAutocomplete";

export interface DigitalObjectModuleData {
    mimeType?:string;
    license_id?: string;
    license_name?: string;
    contentLocation?: string;
}

interface DigitalObjectModuleProps {
  onDataChange: (data: DigitalObjectModuleData) => void;
  showHelp?: boolean;
}

const DigitalObjectAttributes = ({ onDataChange, showHelp = false }: DigitalObjectModuleProps) => {
    const getInitialState = ()  => ({
        mimeType: '',
        license_id: '',
        license_name: '',
        contentLocation: ''
    });

    const [inputs, setInputs] = useState(() : DigitalObjectModuleData => {
        if (typeof window === 'undefined') {
            return getInitialState();
        }

        const digitalObjectInput = localStorage.getItem('digitalObjectAttributesInputs');

        if (digitalObjectInput) {
            return JSON.parse(digitalObjectInput);
        }

        return getInitialState();
    });

    useEffect(() => {
        localStorage.setItem('digitalObjectAttributesInputs', JSON.stringify(inputs));
    }, [inputs]);

    const handleMimetypeSelect = (value: string) => {
        const newInputs = { ...inputs, mimeType: value};
        setInputs(newInputs);
        onDataChange(newInputs);
        if (typeof window !== 'undefined') {
          localStorage.setItem('digitalObjectAttributesInputs', JSON.stringify(newInputs));
        }
    };

    const handleLicenseSelect = (id: string, name: string, url: string) => {
        const newInputs = { ...inputs, license_id: id, license_name: name };
        setInputs(newInputs);
        onDataChange(newInputs);
        if (typeof window !== 'undefined') {
          localStorage.setItem('digitalObjectAttributesInputs', JSON.stringify(newInputs));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const newInputs = { ...inputs, [name]: value };
      setInputs(newInputs);
      onDataChange(newInputs);
      if (typeof window !== 'undefined') {
        localStorage.setItem('digitalObjectAttributesInputs', JSON.stringify(newInputs));
      }
    };

    return (
        <div className="card bg-base-100 shadow-sm">
            {showHelp ? (
                <div className="card-body">
                    <figure className="relative w-full h-64">
                        <img
                            src="./dataset_background.png"
                            alt="DigitalObjectBackground"
                            className="opacity-10 logo w-full h-full object-contain"/>
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-secondary p-4">
                            <span className="text-base">
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
                </div>
            ) : (
                <div className="card-body">
                    <div className="flex items-center gap-2">
                        <fieldset className="fieldset w-full">
                            <label className="input w-full">
                                <FileType/>
                                <MimeTypeAutocomplete
                                    value={inputs.mimeType ?? ''}
                                    onChange={(value) => setInputs(inputs => ({...inputs, mimeType: value}))}
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
                                      onChange={(value) => {
                                          setInputs(prev => ({
                                              ...prev,
                                              license_id: value,
                                          }));
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
            )}
        </div>
    );
};

DigitalObjectAttributes.displayName = 'DigitalObjectAttributes';

export default DigitalObjectAttributes;


export { DigitalObjectAttributes };

