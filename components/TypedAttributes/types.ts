import {TypeDefinition} from "@/components/SimpleTypeRegistryComponent/types";

export interface TypeAttributesModuleProps {
    onDataChange: (data: TypedAttributesModuleData) => void;
    showHelp?: boolean;
}

export interface TypedAttributesItem {
  typeId: string;
  typeName: string;
  value: Record<string, any>;
  validator?: "JSON" | "SPARQL";
  validatorInput?: string;
  validatorEndpoint?: string;
  validatorArguments?: Array<{ key: string; value: string }>;
  _typeDef?: TypeDefinition;
}

export interface TypedAttributesModuleData {
  properties: TypedAttributesItem[];
}
