import { useState, useEffect, useCallback } from "react";
import { TypeDefinition } from "@/components/SimpleTypeRegistryComponent/types";

const isValidValidator = (validator: string): validator is "JSON" | "SPARQL" => {
  return validator === "JSON" || validator === "SPARQL";
};

export const useSimpleTypeRegistry = (
  initialType?: TypeDefinition | null,
  initialValue?: any,
  onValueChange?: (value: any) => void,
  onTypeSelect?: (type: TypeDefinition, value: any) => void
) => {
  const [typeOptions, setTypeOptions] = useState<TypeDefinition[]>([]);
  const [selectedType, setSelectedType] = useState<TypeDefinition | null>(initialType || null);
  const [formValue, setFormValue] = useState<any>(initialValue || {});
  const [jsonSchema, setJsonSchema] = useState<any>(null);
  const [sparqlQuery, setSparqlQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTypeOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/type-registry/types');
      const result = await res.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setTypeOptions(result.types || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypeOptions();
  }, [loadTypeOptions]);

  const loadValidatorConfig = useCallback(async (type: TypeDefinition) => {
    if (!type.validatorInput) return;

    if (type.validator === "JSON") {
      try {
        const res = await fetch(
          `/api/type-registry/validator?validatorInput=${encodeURIComponent(type.validatorInput)}&validatorType=JSON`
        );
        const result = await res.json();
        if (result.data) {
          setJsonSchema(result.data);
          setSparqlQuery("");
        }
      } catch (error) {
        console.error("Error loading JSON schema:", error);
      }
    } else if (type.validator === "SPARQL") {
      try {
        const res = await fetch(
          `/api/type-registry/validator?validatorInput=${encodeURIComponent(type.validatorInput)}&validatorType=SPARQL`
        );
        const result = await res.json();
        if (result.data) {
          setSparqlQuery(result.data);
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
  }, [initialType, loadValidatorConfig]);

  useEffect(() => {
    if (selectedType?.validatorInput) {
      loadValidatorConfig(selectedType);
    }
  }, [selectedType?.validatorInput, selectedType?.validator, loadValidatorConfig]);

  const handleTypeSelect = (type: TypeDefinition) => {
    setSelectedType(type);
    setFormValue({});
    if (onTypeSelect) {
      onTypeSelect(type, {});
    }
  };

  const handleFormChange = (data: any) => {
    setFormValue(data.formData);
    if (onValueChange) {
      onValueChange(data.formData);
    }
    if (selectedType && onTypeSelect) {
      onTypeSelect(selectedType, data.formData);
    }
  };

  const handleSparqlSelect = (value: any) => {
    setFormValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
    if (selectedType && onTypeSelect) {
      onTypeSelect(selectedType, value);
    }
  };

  const resetSelection = () => {
    setSelectedType(null);
    setFormValue({});
    setJsonSchema(null);
    setSparqlQuery("");
  };

  return {
    typeOptions,
    selectedType,
    formValue,
    jsonSchema,
    sparqlQuery,
    handleTypeSelect,
    handleFormChange,
    handleSparqlSelect,
    resetSelection,
    loading,
    error
  };
};

export { isValidValidator };
