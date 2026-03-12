import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Form } from "@rjsf/daisyui";
import validator from "@rjsf/validator-ajv8";
import {Icon} from "@iconify/react";

const TYPE_REGISTRY_BASE = "https://raw.githubusercontent.com/ThomasJejkal/simple-type-registry/main/types";

interface ValidatorArgument {
  key: string;
  value: string;
}

export interface TypeDefinition {
  pid: string;
  name: string;
  description: string;
  validator: "JSON" | "SPARQL";
  validatorInput?: string;
  validatorEndpoint?: string;
  validatorArguments?: ValidatorArgument[];
}

interface SimpleTypeRegistryComponentProps {
  onTypeSelect: (type: TypeDefinition, value: any) => void;
  onValueChange?: (value: any) => void;
  initialType?: TypeDefinition | null;
  initialValue?: any;
}

const GITHUB_API_BASE = "https://api.github.com/repos/ThomasJejkal/simple-type-registry/git/trees/main?recursive=1";
const TYPES_PATH = "types";

const isValidValidator = (validator: string): validator is "JSON" | "SPARQL" => {
  return validator === "JSON" || validator === "SPARQL";
};

const SimpleTypeRegistryComponent = ({ 
  onTypeSelect, 
  onValueChange,
  initialType,
  initialValue 
}: SimpleTypeRegistryComponentProps) => {
  const [selectedType, setSelectedType] = useState<TypeDefinition | null>(initialType || null);
  const [formValue, setFormValue] = useState<any>(initialValue || {});
  const [jsonSchema, setJsonSchema] = useState<any>(null);
  const [sparqlQuery, setSparqlQuery] = useState<string>("");
  const [typeOptions, setTypeOptions] = useState<TypeDefinition[]>([]);
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [internalKey, setInternalKey] = useState(0);

  useEffect(() => {
    const loadTypeOptions = async () => {
      try {
        const treeRes = await fetch(GITHUB_API_BASE);
        if (!treeRes.ok) {
          console.error("Failed to fetch type registry tree:", treeRes.status);
          return;
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
            
            // Validate type structure
            if (!type.pid || !type.name || !type.description) {
              console.warn(`Invalid type definition in ${file}: missing required fields (pid, name, description)`);
              continue;
            }
            
            // Validate validator type
            if (!isValidValidator(type.validator)) {
              console.warn(`Invalid validator in ${file}: "${type.validator}" is not supported. Supported validators: JSON, SPARQL`);
              continue;
            }
            
            // Validate JSON validator has validatorInput
            if (type.validator === "JSON" && !type.validatorInput) {
              console.warn(`Invalid type definition in ${file}: JSON validator requires validatorInput`);
              continue;
            }
            
            // Validate SPARQL validator has validatorInput
            if (type.validator === "SPARQL" && !type.validatorInput) {
              console.warn(`Invalid type definition in ${file}: SPARQL validator requires validatorInput`);
              continue;
            }
            
            types.push(type as TypeDefinition);
          } catch (error) {
            console.warn(`Error parsing type ${file}:`, error);
          }
        }
        
        setTypeOptions(types);
      } catch (error) {
        console.error("Error loading type options:", error);
      }
    };
    loadTypeOptions();
  }, []);

  // Load validator config when selectedType changes
  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
      setFormValue(initialValue || {});
      loadValidatorConfig(initialType);
    }
  }, [initialType]);

  // Only reload schema/query when validatorInput changes
  useEffect(() => {
    if (selectedType?.validatorInput) {
      loadValidatorConfig(selectedType);
    }
  }, [selectedType?.validatorInput, selectedType?.validator]);

  const loadValidatorConfig = async (type: TypeDefinition) => {
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
  };

  const handleTypeSelect = (type: TypeDefinition) => {
    setSelectedType(type);
    setTypeSelectorOpen(false);
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

  // Close DaisyUI dropdown when an option is clicked
  useEffect(() => {
    if (!jsonSchema) return;
    
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if clicked element is an LI inside dropdown-content (option selection)
      const listItem = target.closest('li') as HTMLElement;
      if (listItem) {
        const dropdownContent = listItem.closest('.dropdown-content') as HTMLElement;
        if (dropdownContent) {
          // Find the parent dropdown and close it
          const dropdown = dropdownContent.closest('.dropdown') as HTMLElement;
          if (dropdown) {
            // Add dropdown-close to trigger closing animation
            dropdown.classList.add('dropdown-close');
            // Remove both classes after a short delay so it can be reopened
            setTimeout(() => {
              dropdown.classList.remove('dropdown-close');
              dropdown.classList.remove('dropdown-open');
            }, 200);
          }
        }
      }
    };

    // Use capture phase to catch clicks before DaisyUI handles them
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [jsonSchema]);

  const resetSelection = () => {
    setSelectedType(null);
    setFormValue({});
    setJsonSchema(null);
    setSparqlQuery("");
  };

  return (
    <div className="w-full">
      <style jsx global>{`
        /* Fix for DaisyUI dropdown not closing after select option chosen */
        .rjsf-fix-selects .dropdown-content.show {
          display: none !important;
        }
        .rjsf-fix-selects .dropdown-open .dropdown-content {
          display: none !important;
        }
        .rjsf-fix-selects select:active + .dropdown-content {
          display: none !important;
        }
      `}</style>
      {!selectedType ? (
        <div className="relative">
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
                  handleTypeSelect(type);
                }
              }}
            >
              <option key="" value="" disabled>Choose a type...</option>
              {typeOptions.map((type: TypeDefinition) => (
                <option key={type.pid} value={type.pid}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </fieldset>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{selectedType.name}</h4>
              <p className="text-sm text-base-content/60">{selectedType.description}</p>
              <p className="text-xs text-base-content/40 mt-1">{selectedType.pid}</p>
            </div>
            <button
              onClick={resetSelection}
              className="btn btn-ghost btn-sm"
              title="Change type"
            >
                <Icon icon="mdi:pencil" width="16" height="16" />
            </button>
          </div>

          {selectedType.validator === "JSON" && jsonSchema ? (
            <div key={internalKey} className="mt-4 rjsf-fix-selects">
              <Form
                schema={jsonSchema}
                formData={formValue}
                onSubmit={handleFormChange}
                onChange={handleFormChange}
                validator={validator}
                className="w-full"
                uiSchema={{
                  'ui:autofocus': false
                }}
              >
                <div className="mt-4" />
              </Form>
            </div>
          ) : selectedType.validator === "SPARQL" && sparqlQuery ? (
            <div className="mt-4">
              <SparqlValidator 
                query={sparqlQuery} 
                endpoint={selectedType.validatorEndpoint || ""}
                arguments={selectedType.validatorArguments || []}
                initialValue={formValue}
                onSelect={(value) => {
                  setFormValue(value);
                  if (onValueChange) {
                    onValueChange(value);
                  }
                  if (selectedType) {
                    onTypeSelect(selectedType, value);
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-sm text-base-content/60">
              Loading validator configuration...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SparqlValidatorProps {
  query: string;
  endpoint: string;
  arguments?: ValidatorArgument[];
  onSelect: (value: any) => void;
  initialValue?: any;
}

const SparqlValidator = ({ query, endpoint, arguments: validatorArgs = [], onSelect, initialValue }: SparqlValidatorProps) => {
  const [selected, setSelected] = useState<any>(initialValue || null);

  const handleSelect = (result: any) => {
    setSelected(result);
    onSelect(result);
  };

  const handleClear = () => {
    setSelected(null);
    onSelect(null);
  };

  return (
    <SparqlAutocomplete
      query={query}
      endpoint={endpoint}
      arguments={validatorArgs}
      onSelect={handleSelect}
      onClear={handleClear}
      initialSelected={initialValue}
    />
  );
};

interface SparqlAutocompleteProps {
  query: string;
  endpoint: string;
  arguments?: ValidatorArgument[];
  onSelect: (result: any) => void;
  onClear?: () => void;
  initialSelected?: any;
}

const SparqlAutocomplete = ({ query, endpoint, arguments: validatorArgs = [], onSelect, onClear, initialSelected }: SparqlAutocompleteProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSelected?.label || "");
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(initialSelected || null);

  useEffect(() => {
    if (initialSelected && initialSelected.label && initialSelected.uri) {
      setSelected(initialSelected);
      setSearchTerm(initialSelected.label || "");
    }
  }, [initialSelected]);

  useEffect(() => {
    const executeSearch = async () => {
      if (searchTerm.length < 2) {
        setOptions([]);
        return;
      }

      try {
        const res = await fetch('/api/sparql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, query, term: searchTerm, arguments: validatorArgs })
        });

        if (!res.ok) {
          throw new Error(`SPARQL query failed: ${res.status}`);
        }

        const data = await res.json();
        const formatted = (data.results || []).map((b: any) => ({
          label: b.label || "",
          uri: b.uri || ""
        }));

        setOptions(formatted);
      } catch (error) {
        console.error("SPARQL search error:", error);
        setOptions([]);
      }
    };

    const debounce = setTimeout(executeSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, query, endpoint, validatorArgs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const matchedOption = options.find(opt => opt.label === value);
    if (matchedOption) {
      setSelected(matchedOption);
      setOptions([]);
      onSelect(matchedOption);
    }
  };

  const handleClear = () => {
    setSelected(null);
    setSearchTerm("");
    setOptions([]);
    onClear?.();
  };

  return (
    <div className="w-full flex items-center gap-2">
      <input
        value={searchTerm}
        onChange={handleChange}
        className="flex-1 input"
        placeholder="Search..."
        list="sparql-suggestions"
      />
      {selected && selected.label && selected.uri && (
        <button
          type="button"
          onClick={handleClear}
          className="btn btn-ghost btn-sm"
          title="Clear selection"
        >
          <Trash2 width="16" height="16" />
        </button>
      )}
      <datalist id="sparql-suggestions">
        {options.map((option, index) => (
          <option 
            key={index} 
            value={option.label}
          />
        ))}
      </datalist>
    </div>
  );
};

export default SimpleTypeRegistryComponent;
