export interface AdditionalAttributeRow {
    key: string;
    value: string;
}

export interface AdditionalAttributesProps {
    onDataChange: (data: AdditionalAttributeRow[]) => void;
    showHelp?: boolean;
}
