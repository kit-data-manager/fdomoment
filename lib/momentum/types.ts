export type ResearchDomain = {
  id: string;
  label: string;
  category: string;
};

export type ModuleStatus =
  | 'pristine'
  | 'incomplete'
  | 'complete';

export type TemplateType = 
  | 'dataobject'
  | 'software'
  | 'publication'
  | null;

export type ModuleIdentifier = 'core' | 'dataobject' | 'software' | 'publication' | 'misc';

export type TemplateConfig = {
  type: TemplateType;
  baseType: 'dataobject' | 'software' | 'publication';
  label: string;
  description: string;
  icon: string;
  baseModules: ModuleIdentifier[];
  supportsPublication: boolean;
};

export type CoreMetadata = {
  researchDomain: ResearchDomain | null;
  orcid: string;
  orcidName: string | null;
  orcidEmail: string | null;
  orcidValidated: boolean;
};

export type DataObjectMetadata = {
  license: string;
  licenseUrl: string;
  mimeType: string;
  dataUrl: string;
  dataUrlValidated: boolean;
  dataUrlRepository: string | null;
};

export type SoftwareMetadata = {
  repositoryType: 'GitHub' | 'GitLab.com' | 'Codebase@Helmholtz' | 'GitLab@Kit' | 'Other';
  repositoryUrl: string;
  license: string;
  licenseImported: boolean;
  readmeUrl: string;
  readmeImported: boolean;
};

export type Creator = {
  id: string;
  name: string;
};

export type PublicationMetadata = {
  doi: string;
  title: string;
  titleImported: boolean;
  publicationType: string;
  publicationTypeImported: boolean;
  creators: Creator[];
  creatorsImported: boolean;
};

import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent/types';

export type MiscEntry = {
  id: string;
  key: string;
  value: string | any;
  attributeType: 'custom' | 'typed';
  isTyped?: boolean;
  typeDef?: TypeDefinition;
};

export type MiscMetadata = {
  entries: MiscEntry[];
};

export type EditorState = {
  template: TemplateType;
  enabledModules: string[];

  core: CoreMetadata;
  dataobject: DataObjectMetadata;
  software: SoftwareMetadata;
  publication: PublicationMetadata;
  misc: MiscMetadata | null;

  moduleStatus: {
    core: ModuleStatus;
    dataobject: ModuleStatus;
    software: ModuleStatus;
    publication: ModuleStatus;
    misc: ModuleStatus;
  };

  activeModule:
    | 'core'
    | 'template-select'
    | 'dataobject'
    | 'software'
    | 'publication'
    | 'misc';
};

export type FairScore = {
  findable: number;
  accessible: number;
  interoperable: number;
  reusable: number;
  total: number;
};

export type ScoreTip = {
  text: string;
  targetModule: EditorState['activeModule'];
  scoreGain: number;
};
