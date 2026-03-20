import React from 'react';
import {TestTubeDiagonal} from "lucide-react";
import { OwnerIdAutocomplete } from '@/components/OwnerIdAutocomplete';
import {CoreAttributesModuleProps} from "@/components/CoreAttributes/types";
import {useCoreAttributes} from "@/components/CoreAttributes/useCoreAttributes";

const CoreAttributes = ({ showHelp = false }: CoreAttributesModuleProps) => {

const {
    inputs,
    handleChange,
    handleOwnerIdChange,
    handleOwnerIdSelect,
    handleTypeChange
} = useCoreAttributes();

  return (
      <div className="card bg-base-100 shadow-sm">
        {showHelp ? (
          <div className="card-body">
            <figure className="relative w-full h-64">
              <img
                  src="./basic_background.png"
                  alt="CoreAttributesBackground"
                  className="opacity-10 logo w-full h-full object-contain"/>
              <div
                  className="absolute inset-0 flex flex-col justify-center items-center text-secondary p-4">
                  <span className="text-base">
                      This module contributes core kernel attributes to define <span className="text-info">ownership and context</span> {" "}
                      of the FAIR Digital Object. These information can be used to associate an FDO with a user, an organization,
                      or a research field, which facilitates basic <span className="text-info">findability</span>.
                  </span>
                <br/>
                  <span className="text-lg">All attributes in this module can be locally persisted to reuse them across all
                      your FDOs.
                </span>
              </div>
            </figure>
          </div>
        ) : (
          <div className="card-body">
            <div className="flex items-center gap-2">
              <fieldset className="fieldset w-full relative">
                <label className="input w-full relative z-60">

                  <OwnerIdAutocomplete
                      value={inputs.owner_id ?? ''}
                      displayValue={inputs.owner_display ?? ''}
                      idType={inputs.owner_id_type ?? 'ORCiD'}
                      onChange={handleOwnerIdChange}
                      onSelect={handleOwnerIdSelect}
                      onTypeChange={handleTypeChange}
                  />
                </label>
                <p className="label">
                    {inputs.owner_id_type === 'ORCiD' 
                      ? 'The ORCiD identifier of the owner entered in \'lastName, firstName\' format.'
                      : 'The research organization identifier (ROR) of the owner\'s primary affiliation.'}
                </p>
              </fieldset>
            </div>
            <div className="flex items-center gap-2">
              <fieldset className="fieldset w-full">
                <label className="input w-full">
                  <TestTubeDiagonal/>
                  <select
                    name="research_field"
                    value={inputs.research_field}
                    onChange={handleChange}
                    className="select select-ghost w-full"
                  >
                    <option value="">Select a research field</option>
                    <option value="Aeronautics, Space, Transport">Aeronautics, Space, Transport</option>
                    <option value="Earth&Environment">Earth & Environment</option>
                    <option value="Energy">Energy</option>
                    <option value="Health">Health</option>
                    <option value="Information" >Information</option>
                    <option value="Matter">Matter</option>
                  </select>
                </label>
                <p className="label">The research field the FDO is associated with.</p>
              </fieldset>
            </div>
          </div>
        )}
      </div>
  );
};

CoreAttributes.displayName = 'CoreAttributes';

export default CoreAttributes;
