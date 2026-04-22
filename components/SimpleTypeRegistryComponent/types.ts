export interface TypeDefinition {
  pid: string;
  name: string;
  description: string;
  category: string;
  validator: "JSON" | "SPARQL" | "LINK";
  validatorInput?: string;
  validatorEndpoint?: string;
  validatorArguments?: ValidatorArgument[];
}

export interface ValidatorArgument {
  key: string;
  value: string;
}

export interface SimpleTypeRegistryComponentProps {
  onTypeSelect: (type: TypeDefinition, value: any) => void;
  onValueChange?: (value: any) => void;
  initialType?: TypeDefinition | null;
  initialValue?: any;
}
