import { TemplateType, TemplateConfig } from '@/lib/momentum/types';

export interface TemplateSelectionProps {
  onSelectTemplate: (template: TemplateType) => void;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    type: 'published-dataobject',
    baseType: 'dataobject',
    label: 'Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data',
    icon: '🗄️',
    baseModules: ['core', 'dataobject', 'publication', 'misc'],
    supportsPublication: true,
  },
  {
    type: 'published-software',
    baseType: 'software',
    label: 'Software',
    description: 'Source Code, Workflows, Tools, Scripts',
    icon: '💻',
    baseModules: ['core', 'software', 'publication', 'misc'],
    supportsPublication: true,
  },
  {
    type: 'unpublished-dataobject',
    baseType: 'dataobject',
    label: 'Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data',
    icon: '🗄️',
    baseModules: ['core', 'dataobject', 'misc'],
    supportsPublication: false,
  },
  {
    type: 'unpublished-software',
    baseType: 'software',
    label: 'Software',
    description: 'Source Code, Workflows, Tools, Scripts',
    icon: '💻',
    baseModules: ['core', 'software', 'misc'],
    supportsPublication: false,
  },
  {
    type: 'published-publication',
    baseType: 'publication',
    label: 'Publication',
    description: 'Journal Articles, Conference Papers, Reports',
    icon: '📚',
    baseModules: ['core', 'publication', 'misc'],
    supportsPublication: true,
  },
];
