import React, { useState, useEffect } from 'react';
import {TestTubeDiagonal} from "lucide-react";
import OwnerIdAutocomplete, { OwnerIdType } from '@/components/OwnerIdAutocomplete';

export interface CoreAttributesModuleData {
    owner_id?: string,
    owner_name?: string,
    owner_display?: string,
    owner_id_type?: OwnerIdType,
    research_field?: string
}

interface CoreAttributesModuleProps {
  onDataChange: (data: CoreAttributesModuleData) => void;
}

const CoreAttributes = ({ onDataChange }: CoreAttributesModuleProps) => {
  const getInitialState = () => ({
    owner_id: '',
    owner_name: '',
    owner_display: '',
    owner_id_type: 'ORCiD' as OwnerIdType,
    research_field: ''
  });

  const [inputs, setInputs] = useState(() => {
    if (typeof window === 'undefined') {
      return getInitialState();
    }
    
     const coreInput = localStorage.getItem('coreAttributesInputs');

      if (coreInput) {
        return JSON.parse(coreInput);
      }
    
    return getInitialState();
  });

  useEffect(() => {
    localStorage.setItem('coreAttributesInputs', JSON.stringify(inputs));
  }, [inputs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newInputs = { ...inputs, [name]: value };
    setInputs(newInputs);
    onDataChange(newInputs);
  };

  const handleOwnerIdChange = (value: string) => {
    const newInputs = { 
      ...inputs, 
      owner_id: value,
      owner_display: value
    };
    setInputs(newInputs);
  };

  const handleOwnerIdSelect = (id: string, name: string, type: OwnerIdType) => {
    const newInputs = { 
      ...inputs, 
      owner_id: id, 
      owner_name: name,
      owner_display: `${name} (${id})`,
      owner_id_type: type
    };
    setInputs(newInputs);
    onDataChange(newInputs);
  };

  const handleTypeChange = (type: OwnerIdType) => {
    const newInputs = { 
      ...inputs, 
      owner_id_type: type,
      owner_id: '',
      owner_name: '',
      owner_display: ''
    };
    setInputs(newInputs);
  };

  return (
      <div className="card card-side bg-base-100 shadow-sm">
        <figure className="relative w-72 h-full">
          <img
              src="./basic_background.png"
              alt="CoreAttributesBackground"
              className="opacity-10 logo border-r-2 border-secondary"/>
          <div
              className="absolute -top-12 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
              <span className="text-sm">
                  This module contributes core kernel attributes to define <span className="text-info">ownership and context</span> {" "}
                  of the FAIR Digital Object. These information can be used to associate an FDO with a user, an organization,
                  or a research field, which facilitates basic <span className="text-info">findability</span>.
              </span>
            <br/>
              <span className="text-sm">All attributes in this module can be locally persisted to reuse them across all
                  your FDOs.
            </span>
          </div>
        </figure>
        <div className="card-body">
          <div className="flex items-center gap-2 z-60">
            <fieldset className="fieldset w-full">
              <label className="input w-full">

                <OwnerIdAutocomplete
                    value={inputs.owner_id}
                    displayValue={inputs.owner_display}
                    idType={inputs.owner_id_type}
                    onChange={handleOwnerIdChange}
                    onSelect={handleOwnerIdSelect}
                    onTypeChange={handleTypeChange}
                />
              </label>
              <p className="label">
                  {inputs.owner_id_type === 'ORCiD' 
                    ? 'The ORCiD identifier of the owner.' 
                    : 'The research organization identifier (ROR) of the owner\'s primary affiliation.'}
              </p>
            </fieldset>
          </div>
          <div className="flex items-center gap-2">
            <fieldset className="fieldset w-full">
              <label className="fieldset">
                <div className="input w-full">
                  <TestTubeDiagonal/>
                  <select
                    name="research_field"
                    value={inputs.research_field}
                    onChange={handleChange}
                    className="w-full"
                  >
                    <option value="" className="text-neutral">Select a research field</option>
                    <option value="Aeronautics, Space, Transport" className="text-neutral">Aeronautics, Space, Transport</option>
                    <option value="Earth&Environment" className="text-neutral">Earth & Environment</option>
                    <option value="Energy" className="text-neutral">Energy</option>
                    <option value="Health" className="text-neutral">Health</option>
                    <option value="Information" className="text-neutral">Information</option>
                    <option value="Matter" className="text-neutral">Matter</option>
                  </select>
                </div>
              </label>
              <p className="label">The research field the FDO is associated with.</p>
            </fieldset>
          </div>
        </div>
      </div>
  );
};

CoreAttributes.displayName = 'CoreAttributes';

export default CoreAttributes;
