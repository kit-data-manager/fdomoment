import { useState, useEffect, useCallback } from "react";
import { TypeDefinition } from "@/components/SimpleTypeRegistryComponent/types";

const GITHUB_API_BASE = "https://api.github.com/repos/ThomasJejkal/simple-type-registry/git/trees/main?recursive=1";
const TYPES_PATH = "types";
const TYPE_REGISTRY_BASE = "https://raw.githubusercontent.com/ThomasJejkal/simple-type-registry/main/types";

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
      const treeRes = await fetch(GITHUB_API_BASE);
      if (!treeRes.ok) {
        throw new Error(`Failed to fetch type registry tree: ${treeRes.status}`);
      }

      const treeData = await treeRes.json();
      const jsonFiles = treeData.tree
          .filter((item: any) => item.path.startsWith(TYPES_PATH) && item.path.endsWith('.json'))
          .map((item: any) => item.path.replace(`${TYPES_PATH}/`, ""));

      const types: TypeDefinition[] = [];
      for (const file of jsonFiles) {
        try {
          const res = await fetch(`${TYPE_REGISTRY_BASE}/${file}`);
          if (!res.ok) {
            console.warn(`Failed to load type ${file}: ${res.status}`);
            continue;
          }

          const type = await res.json();

          if (!type.pid || !type.name || !type.description) {
            console.warn(`Invalid type definition in ${file}: missing required fields`);
            continue;
          }

          if (!isValidValidator(type.validator)) {
            console.warn(`Invalid validator in ${file}: "${type.validator}"`);
            continue;
          }

          if (type.validator === "JSON" && !type.validatorInput) {
            console.warn(`Invalid type definition in ${file}: JSON validator requires validatorInput`);
            continue;
          }

          if (type.validator === "SPARQL" && !type.validatorInput) {
            console.warn(`Invalid type definition in ${file}: SPARQL validator requires validatorInput`);
            continue;
          }

          types.push(type as TypeDefinition);
        } catch (err) {
          console.warn(`Error parsing type ${file}:`, err);
        }
      }

      setTypeOptions(types);
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
