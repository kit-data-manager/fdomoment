export interface Creator {
  id?: string;
  name?: string;
  orcid?: string;
}

export interface PublicationAttributesModuleData {
  doi?: string;
  publicationType?: string;
  title?: string;
  publicationYear?: string;
  creators: Creator[];
}

export interface PublicationAttributesModuleProps {
  showHelp?: boolean;
}
