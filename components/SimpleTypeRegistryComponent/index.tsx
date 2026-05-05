import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { TypeDefinition } from "@/components/SimpleTypeRegistryComponent/types";
import { useSimpleTypeRegistry } from "@/components/SimpleTypeRegistryComponent/useSimpleTypeRegistry";
import TypeSelector from "@/components/SimpleTypeRegistryComponent/TypeSelector";
import JsonValidatorForm from "@/components/SimpleTypeRegistryComponent/forms/JsonValidatorForm";
import SparqlValidatorForm from "@/components/SimpleTypeRegistryComponent/forms/SparqlValidatorForm";
import LinkValidatorForm from "@/components/SimpleTypeRegistryComponent/forms/LinkValidatorForm";
import type { LinkValidatorFormRef } from "@/components/SimpleTypeRegistryComponent/types";

interface SimpleTypeRegistryComponentProps {
  onTypeSelect: (type: TypeDefinition, value: any) => void;
  onValueChange?: (value: any) => void;
  onReset?: () => void;
  initialType?: TypeDefinition | null;
  initialValue?: any;
}

export interface SimpleTypeRegistryRef {
  reset: () => void;
  acceptSelection: () => string | null;
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
    resetSelection,
    loading
  } = useSimpleTypeRegistry(initialType, initialValue, onValueChange, onTypeSelect);

  const linkValidatorRef = useRef<LinkValidatorFormRef | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      resetSelection();
    },
    acceptSelection: (): string | null => {
      console.log('SimpleTypeRegistryComponent: acceptSelection called, selectedType.validator:', selectedType?.validator);
      if (selectedType?.validator === 'LINK' && linkValidatorRef.current) {
        console.log('SimpleTypeRegistryComponent: calling linkValidatorRef.current.acceptSelection()');
        const result = linkValidatorRef.current.acceptSelection();
        console.log('SimpleTypeRegistryComponent: acceptSelection returned:', result);
        return result;
      } else {
        console.log('SimpleTypeRegistryComponent: condition not met, selectedType?.validator === LINK:', selectedType?.validator === 'LINK', 'linkValidatorRef.current:', !!linkValidatorRef.current);
        return null;
      }
    }
  }), [resetSelection, selectedType]);

  return (
    <div className="w-full">
      <TypeSelector
        typeOptions={typeOptions}
        selectedType={selectedType}
        onSelect={handleTypeSelect}
        onReset={resetSelection}
        onResetComplete={onReset}
        loading={loading}
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
             <div className="mt-4">
               <LinkValidatorForm
                 ref={linkValidatorRef}
                 typePid={selectedType.pid}
                 typeName={selectedType.name}
                 onValueChange={(pid) => {
                   if (typeof handleFormChange === 'function') {
                     handleFormChange({ formData: pid });
                   }
                 }}
               />
             </div>
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
