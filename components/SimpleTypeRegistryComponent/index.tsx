import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { TypeDefinition } from "@/components/SimpleTypeRegistryComponent/types";
import { useSimpleTypeRegistry } from "@/components/SimpleTypeRegistryComponent/useSimpleTypeRegistry";
import TypeSelector from "@/components/SimpleTypeRegistryComponent/TypeSelector";
import JsonValidatorForm from "@/components/SimpleTypeRegistryComponent/forms/JsonValidatorForm";
import SparqlValidatorForm from "@/components/SimpleTypeRegistryComponent/forms/SparqlValidatorForm";
import LinkValidatorForm from "@/components/SimpleTypeRegistryComponent/forms/LinkValidatorForm";

interface SimpleTypeRegistryComponentProps {
  onTypeSelect: (type: TypeDefinition, value: any) => void;
  onValueChange?: (value: any) => void;
  onReset?: () => void;
  initialType?: TypeDefinition | null;
  initialValue?: any;
}

export interface SimpleTypeRegistryRef {
  reset: () => void;
}

const SimpleTypeRegistryComponent = forwardRef<SimpleTypeRegistryRef, SimpleTypeRegistryComponentProps>(({ 
  onTypeSelect, 
  onValueChange,
  onReset,
  initialType,
  initialValue 
}: SimpleTypeRegistryComponentProps, ref) => {
  const {
    typeOptions,
    selectedType,
    formValue,
    jsonSchema,
    sparqlQuery,
    handleTypeSelect,
    handleFormChange,
    handleSparqlSelect,
    resetSelection
  } = useSimpleTypeRegistry(initialType, initialValue, onValueChange, onTypeSelect);

  useImperativeHandle(ref, () => ({
    reset: () => {
      resetSelection();
    }
  }), [resetSelection]);

  return (
    <div className="w-full">
      <TypeSelector
        typeOptions={typeOptions}
        selectedType={selectedType}
        onSelect={handleTypeSelect}
        onReset={resetSelection}
        onResetComplete={onReset}
      />

      {selectedType && (
        <>
          {selectedType.validator === "JSON" && jsonSchema ? (
            <JsonValidatorForm
              schema={jsonSchema}
              formData={formValue}
              onChange={handleFormChange}
            />
          ) : selectedType.validator === "SPARQL" && sparqlQuery ? (
            <div className="mt-4">
              <SparqlValidatorForm
                query={sparqlQuery}
                endpoint={selectedType.validatorEndpoint || ""}
                arguments={selectedType.validatorArguments || []}
                initialValue={formValue}
                onSelect={handleSparqlSelect}
              />
            </div>
          ) : selectedType.validator === "LINK" ? (
            <LinkValidatorForm
              typePid={selectedType.pid}
              typeName={selectedType.name}
              onValueChange={(pid) => {
                if (typeof handleFormChange === 'function') {
                  handleFormChange({ formData: pid });
                }
              }}
            />
          ) : (
            <div className="text-sm text-base-content/60">
              Loading validator configuration...
            </div>
          )}
        </>
      )}
    </div>
  );
});

SimpleTypeRegistryComponent.displayName = "SimpleTypeRegistryComponent";

export { SimpleTypeRegistryComponent };
export default SimpleTypeRegistryComponent;
export type { TypeDefinition } from './types';
