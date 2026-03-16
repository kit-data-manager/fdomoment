export interface LicenseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (id: string, name: string, url: string) => void;
}
