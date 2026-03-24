import { useOrcidValidation } from '@/hooks/momentum/useOrcidValidation';
import { CoreMetadata } from '@/lib/momentum/types';

export function useCoreModule(updateCore: (partial: Partial<CoreMetadata>) => void) {
  const { handleOrcidChange } = useOrcidValidation((updates) => {
    updateCore(updates as Partial<CoreMetadata>);
  });

  return {
    handleOrcidChange,
  };
}
