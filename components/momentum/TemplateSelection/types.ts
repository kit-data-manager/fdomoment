import { ModuleIdentifier } from '@/lib/momentum/types';

export interface TemplateSelectionProps {
  onSelectTemplate: (templateId: string, enabledModules: string[]) => void;
}

export interface TemplateModule {
  moduleId: ModuleIdentifier;
  selectable: boolean;
  defaultEnabled?: boolean;
}

export interface TemplateConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
  modules: TemplateModule[];
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'dataobject',
    label: 'Data Object',
    description: 'This template is recommended to create FAIR Digital Objects representing all kinds of digital assets like ' +
        'measurements, images, surveys, tables, or simulation data. Optionally, publication information and additional, custom attributes can be added to increase ' +
        'the FAIR score of the resulting FAIR Digital Object.',
    icon: '🗄️',
    modules: [
      { moduleId: 'core', selectable: false },
      { moduleId: 'dataobject', selectable: false },
      { moduleId: 'publication', selectable: true, defaultEnabled: true },
      { moduleId: 'misc', selectable: true, defaultEnabled: true },
    ],
  },
  {
    id: 'software',
    label: 'Software',
    description: 'This template is recommended to create FAIR Digital Objects representing source code, workflows, tools, or scripts. ' +
        'Optionally, publication information and additional, custom attributes can be added to increase ' +
        'the FAIR score of the resulting FAIR Digital Object.',
    icon: '💻',
    modules: [
      { moduleId: 'core', selectable: false },
      { moduleId: 'software', selectable: false },
      { moduleId: 'publication', selectable: true, defaultEnabled: true },
      { moduleId: 'misc', selectable: true, defaultEnabled: true },
    ],
  },
  {
    id: 'publication',
    label: 'Publication',
    description: 'This template is recommended to create FAIR Digital Objects representing scientific publications like ' +
        'journal articles, conference papers, or reports. Optionally, additional, custom attributes can be added to increase ' +
        'the FAIR score of the resulting FAIR Digital Object.',
    icon: '📚',
    modules: [
      { moduleId: 'core', selectable: false },
      { moduleId: 'publication', selectable: false },
      { moduleId: 'misc', selectable: true },
    ],
  },
];
