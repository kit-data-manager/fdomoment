import { SoftwareMetadata } from '@/lib/momentum/types';

export type RepositoryType = 'GitHub' | 'GitLab.com' | 'Codebase@Helmholtz' | 'GitLab@Kit' | 'Other';

export interface SoftwareModuleProps {
  software: SoftwareMetadata;
  updateSoftware: (partial: Partial<SoftwareMetadata>) => void;
  activatePublication?: () => void;
  setActiveModule?: (module: string) => void;
}
