import React, { useState } from 'react';
import {Building2, Copy, Copyright, FileType, Link, TestTubeDiagonal, Users} from "lucide-react";

interface DatasetSectionProps {
  onDataChange: (data: any) => void;
}

const DatasetSection: React.FC<DatasetSectionProps> = ({ onDataChange }) => {
    const [inputs, setInputs] = useState({
        mimeType: '',
        license: '',
        contentLocation: ''
    });

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const newInputs = { ...inputs, "mimeType": value };
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
                            <select
                                value={inputs.mimeType}
                                onChange={handleSelectChange}
                                className="grow w-full"
                            >
                                <option value="text/plain">Text</option>
                                <option value="image/jpeg">JPEG Image</option>
                                <option value="application/json">JSON</option>
                            </select>
                        </label>
                        <p className="label">The associated content&apos;s mime type.</p>
                    </fieldset>
                </div>
                <div className="flex items-center gap-2">
                    <fieldset className="fieldset w-full">
                        <label className="input w-full">
                            <Copyright/>
                            <select
                                value={inputs.license}
                                onChange={handleSelectChange}
                                className="grow w-full"
                            >
                                <option value="text/plain">Text</option>
                                <option value="image/jpeg">JPEG Image</option>
                                <option value="application/json">JSON</option>
                            </select>
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
    )
};

export default DatasetSection;
