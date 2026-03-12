import { OwnerIdType } from '@/components/OwnerIdAutocomplete';

export interface CoreAttributesModuleData {
  owner_id?: string,
  owner_name?: string,
  owner_display?: string,
  owner_id_type?: OwnerIdType,
  research_field?: string
}

export interface CoreAttributesModuleProps {
  onDataChange: (data: CoreAttributesModuleData) => void;
  showHelp?: boolean;
}
