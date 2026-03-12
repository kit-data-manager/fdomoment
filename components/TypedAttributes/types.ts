import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent';

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
