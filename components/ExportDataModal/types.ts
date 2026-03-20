import { RecordData } from '@/utils/recordBuilder';

export interface ModuleAttribute {
  key: string;
  value: string | string[];
}

export interface ModuleData {
  type: string;
  label: string;
  attributes: ModuleAttribute[];
}

export interface FDOVisualizationProps {
  data: RecordData | null;
}

export interface BlockDefinition {
  type: string;
  message0: string;
  colour: string;
  previousStatement: string | null;
  nextStatement: string | null;
  inputsInline: boolean;
}

export interface ModuleConfig {
  type: string;
  label: string;
  colour: string;
  keys?: string[];
}

export interface ModuleMapping {
  attrs: Record<string, string | string[]>;
  type: string;
  label: string;
}
