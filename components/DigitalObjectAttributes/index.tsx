import React from 'react';
import {Copyright, FileType, Link} from "lucide-react";
import {MimeTypeAutocomplete} from "@/components/MimeTypeAutocomplete";
import {LicenseAutocomplete} from "@/components/LicenseAutocomplete";
import {DigitalObjectModuleProps} from "@/components/DigitalObjectAttributes/types";
import {useDigitalObjectAttributes} from "@/components/DigitalObjectAttributes/useDigitalObjectAttributes";

const DigitalObjectAttributes = ({ onDataChange, showHelp = false }: DigitalObjectModuleProps) => {
    const {
        inputs,
        handleMimetypeSelect,
        handleLicenseSelect,
        handleInputChange,
        setInputs
    } = useDigitalObjectAttributes();

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

export { DigitalObjectAttributes };

