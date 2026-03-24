import { CoreMetadata } from '@/lib/momentum/types';

export interface CoreModuleProps {
  basis: CoreMetadata;
  updateCore: (partial: Partial<CoreMetadata>) => void;
  onNext: () => void;
}
