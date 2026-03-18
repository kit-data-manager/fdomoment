export interface AdditionalAttributeModuleData {
    rows?: AdditionalAttribute[]
}

export interface AdditionalAttribute {
    key: string;
    value: string;
}

export interface AdditionalAttributesProps {
    onDataChange: (data: AdditionalAttributeModuleData) => void;
    showHelp?: boolean;
}
