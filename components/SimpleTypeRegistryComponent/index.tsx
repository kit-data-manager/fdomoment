import React, { useState, useEffect, useCallback } from "react";
import { TypeDefinition } from "./types";
import { useTypeRegistry } from "./useTypeRegistry";
import TypeSelector from "./TypeSelector";
import JsonValidatorForm from "./JsonValidatorForm";
import SparqlValidatorForm from "./SparqlValidatorForm";

const TYPE_REGISTRY_BASE = "https://raw.githubusercontent.com/ThomasJejkal/simple-type-registry/main/types";

interface SimpleTypeRegistryComponentProps {
  onTypeSelect: (type: TypeDefinition, value: any) => void;
  onValueChange?: (value: any) => void;
  initialType?: TypeDefinition | null;
  initialValue?: any;
}

const SimpleTypeRegistryComponent = ({ 
  onTypeSelect, 
  onValueChange,
  initialType,
  initialValue 
}: SimpleTypeRegistryComponentProps) => {
  const { typeOptions } = useTypeRegistry();
  const [selectedType, setSelectedType] = useState<TypeDefinition | null>(initialType || null);
  const [formValue, setFormValue] = useState<any>(initialValue || {});
  const [jsonSchema, setJsonSchema] = useState<any>(null);
  const [sparqlQuery, setSparqlQuery] = useState<string>("");

  const loadValidatorConfig = useCallback(async (type: TypeDefinition) => {
    if (!type.validatorInput) return;

    if (type.validator === "JSON") {
      try {
        const schemaUrl = `${TYPE_REGISTRY_BASE}/${type.validatorInput}`;
        const res = await fetch(schemaUrl);
        if (res.ok) {
          const schema = await res.json();
          setJsonSchema(schema);
          setSparqlQuery("");
        }
      } catch (error) {
        console.error("Error loading JSON schema:", error);
      }
    } else if (type.validator === "SPARQL") {
      try {
        const queryUrl = `${TYPE_REGISTRY_BASE}/${type.validatorInput}`;
        const res = await fetch(queryUrl);
        if (res.ok) {
          const query = await res.text();
          setSparqlQuery(query);
          setJsonSchema(null);
        }
      } catch (error) {
        console.error("Error loading SPARQL query:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
      setFormValue(initialValue || {});
      loadValidatorConfig(initialType);
    }
  }, [initialType]);

  useEffect(() => {
    if (selectedType?.validatorInput) {
      loadValidatorConfig(selectedType);
    }
  }, [selectedType?.validatorInput, selectedType?.validator, loadValidatorConfig]);

  const handleTypeSelect = (type: TypeDefinition) => {
    setSelectedType(type);
    setFormValue({});
    onTypeSelect(type, {});
  };

  const handleFormChange = (data: any) => {
    setFormValue(data.formData);
    if (onValueChange) {
      onValueChange(data.formData);
    }
    if (selectedType) {
      onTypeSelect(selectedType, data.formData);
    }
  };

  const handleSparqlSelect = (value: any) => {
    setFormValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
    if (selectedType) {
      onTypeSelect(selectedType, value);
    }
  };

  const resetSelection = () => {
    setSelectedType(null);
    setFormValue({});
    setJsonSchema(null);
    setSparqlQuery("");
  };

  return (
    <div className="w-full">
      <TypeSelector
        typeOptions={typeOptions}
        selectedType={selectedType}
        onSelect={handleTypeSelect}
        onReset={resetSelection}
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
          ) : (
            <div className="text-sm text-base-content/60">
              Loading validator configuration...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { SimpleTypeRegistryComponent };
export default SimpleTypeRegistryComponent;
export type { TypeDefinition } from './types';
