import { Creator } from '@/lib/momentum/types';

export interface CreatorWithOrcid extends Creator {
  orcid?: string;
  orcidValidated?: boolean;
  orcidName?: string;
  orcidInstitution?: string;
}

export interface PublicationModuleProps {
  publication: {
    doi: string;
    title: string;
    titleImported: boolean;
    publicationType: string;
    publicationTypeImported: boolean;
    creators: CreatorWithOrcid[];
    creatorsImported: boolean;
  };
  updatePublication: (partial: Partial<{
    doi: string;
    title: string;
    titleImported: boolean;
    publicationType: string;
    publicationTypeImported: boolean;
    creators: CreatorWithOrcid[];
    creatorsImported: boolean;
  }>) => void;
}
