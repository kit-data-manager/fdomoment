export type OwnerIdType = 'ORCiD' | 'ROR';

export interface OwnerIdAutocompleteProps {
    value: string;
    displayValue: string;
    idType: OwnerIdType;
    onChange: (value: string) => void;
    onSelect: (id: string, name: string, type: OwnerIdType) => void;
    onTypeChange: (type: OwnerIdType) => void;
}
