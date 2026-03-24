import { Creator } from '@/lib/momentum/types';

export interface CreatorWithOrcid {
  id: string;
  orcid?: string;
  orcidValidated?: boolean;
  orcidName?: string;
  orcidEmail?: string;
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
  showNext?: boolean;
  showPrev?: boolean;
  onNextModule?: () => void;
  onPrevModule?: () => void;
}
