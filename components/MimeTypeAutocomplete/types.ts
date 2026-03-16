export interface MimeType {
  type: string;
  description: string;
}

export interface MimeTypeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (type: string, description: string) => void;
}
