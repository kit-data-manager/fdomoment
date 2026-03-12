import React from "react";
import { TypeDefinition } from "./types";

interface TypeSelectorProps {
  typeOptions: TypeDefinition[];
  selectedType: TypeDefinition | null;
  onSelect: (type: TypeDefinition) => void;
  onReset: () => void;
}

const TypeSelector = ({ typeOptions, selectedType, onSelect, onReset }: TypeSelectorProps) => (
  <div className="w-full">
    {!selectedType ? (
      <fieldset className="fieldset w-full">
        <label className="label w-full">
          <span className="label-text">Select Type</span>
        </label>
        <select
          className="select select-bordered w-full"
          value=""
          onChange={(e) => {
            const type = typeOptions.find((t: TypeDefinition) => t.pid === e.target.value);
            if (type) {
              onSelect(type);
            }
          }}
        >
          <option value="" disabled>Choose a type...</option>
          {typeOptions.map((type) => (
            <option key={type.pid} value={type.pid}>
              {type.name} - {type.description}
            </option>
          ))}
        </select>
      </fieldset>
    ) : (
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{selectedType.name}</h4>
          <p className="text-sm text-base-content/60">{selectedType.description}</p>
          <p className="text-xs text-base-content/40 mt-1">{selectedType.pid}</p>
        </div>
        <button
          onClick={onReset}
          className="btn btn-ghost btn-sm"
          title="Change type"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a16.73 16.73 0 0 1 4 12.73M7 21a16.73 16.73 0 0 1-4-12.73"/>
            <path d="M12 2v10l4 4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </button>
      </div>
    )}
  </div>
);

export default TypeSelector;
