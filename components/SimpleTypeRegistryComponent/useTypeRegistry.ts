import { useState, useEffect, useCallback } from "react";
import { TypeDefinition } from "./types";

const GITHUB_API_BASE = "https://api.github.com/repos/ThomasJejkal/simple-type-registry/git/trees/main?recursive=1";
const TYPES_PATH = "types";
const TYPE_REGISTRY_BASE = "https://raw.githubusercontent.com/ThomasJejkal/simple-type-registry/main/types";

const isValidValidator = (validator: string): validator is "JSON" | "SPARQL" => {
  return validator === "JSON" || validator === "SPARQL";
};

export const useTypeRegistry = () => {
  const [typeOptions, setTypeOptions] = useState<TypeDefinition[]>([]);
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

  return { typeOptions, loading, error };
};

export { isValidValidator };
export default useTypeRegistry;
