import { DataObjectMetadata, CoreMetadata } from '@/lib/momentum/types';

export interface DataObjectModuleProps {
  dataobject: DataObjectMetadata;
  core: CoreMetadata;
  updateDataobject: (partial: Partial<DataObjectMetadata>) => void;
  activatePublication?: () => void;
  setActiveModule?: (module: string) => void;
  showNext?: boolean;
  showPrev?: boolean;
  onNextModule?: () => void;
  onPrevModule?: () => void;
}
