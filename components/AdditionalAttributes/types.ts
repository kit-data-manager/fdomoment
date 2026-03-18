export interface AdditionalAttributeModuleData {
    rows?: AdditionalAttribute[]
}

export interface AdditionalAttribute {
    key: string;
    value: string;
}

export interface AdditionalAttributesProps {
    showHelp?: boolean;
}
