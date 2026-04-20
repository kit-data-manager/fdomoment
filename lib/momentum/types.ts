export type ResearchDomain = {
  id: string;
  label: string;
  //category: string;
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

export interface ModuleDefinition {
  id: ModuleIdentifier;
  label: string;
}

export const MODULES: ModuleDefinition[] = [
  { id: 'core', label: 'Core' },
  { id: 'dataobject', label: 'Data Object' },
  { id: 'software', label: 'Software' },
  { id: 'publication', label: 'Publication' },
  { id: 'misc', label: 'Additional' },
];

export const MODULE_IDS = MODULES.map(m => m.id);
export const MODULE_ORDER = MODULE_IDS;
export const MODULE_LABELS: Record<ModuleIdentifier, string> = MODULES.reduce(
  (acc, m) => ({ ...acc, [m.id]: m.label }),
  {} as Record<ModuleIdentifier, string>
);

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
  repositoryUrlValidated: boolean;
  license: string;
  licenseImported: boolean;
  readmeUrl: string;
  readmeImported: boolean;
};

export type Creator = {
  id: string;
  name: string;
  orcid?: string;
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
    | ModuleIdentifier
    | 'template-select';
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

export type PIDRecordEntry = {
  key: string;
  name: string;
  value: string;
};

export type PIDRecordEntries = Record<string, PIDRecordEntry[]>;

export type PIDRecord = {
  pid?: string;
  entries: PIDRecordEntries;
};