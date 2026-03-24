import { MiscMetadata, ResearchDomain } from '@/lib/momentum/types';
import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent/types';

export interface AdditionalAttributesModuleProps {
  misc: MiscMetadata;
  researchDomain: ResearchDomain | null;
  updateMisc: (entries: MiscMetadata['entries']) => void;
  showNext?: boolean;
  showPrev?: boolean;
  onNextModule?: () => void;
  onPrevModule?: () => void;
}

export interface TypedAttribute {
  id: string;
  key: string;
  typeDef: TypeDefinition;
  value: any;
}

export type AttributesMode = 'custom' | 'typed';
