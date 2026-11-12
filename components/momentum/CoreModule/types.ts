import { CoreMetadata } from '@/lib/momentum/types';

export interface CoreModuleProps {
  basis: CoreMetadata;
  updateCore: (partial: Partial<CoreMetadata>) => void;
  onNext: () => void;
  showNext?: boolean;
  showPrev?: boolean;
  onNextModule?: () => void;
  onPrevModule?: () => void;
}
