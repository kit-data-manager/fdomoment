import React, { useState } from 'react';
import {FileType, Link} from "lucide-react";

interface DatasetSectionProps {
  onDataChange: (data: any) => void;
}

const DatasetSection: React.FC<DatasetSectionProps> = ({ onDataChange }) => {
    const [inputs, setInputs] = useState({
        mimeType: '',
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
      <div className="dataset-section grid grid-cols-1 gap-4">
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
                  <p className="label">The associated content mime type.</p>
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
                  <p className="label">The associated content URL.</p>
              </fieldset>
          </div>
      </div>
  );
};

export default DatasetSection;