/**
 * Template definitions (static configuration).
 *
 * Templates combine modules (by id) with descriptions and the user-facing
 * interaction flow (step order). Adding a new template here is just configuration:
 * the template selection UI, navigation, FAIR scoring and record building all
 * consume these definitions.
 */
import { TemplateDefinition } from './config';

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'dataobject',
    label: 'Data Object',
    description:
      'This template is recommended to create FAIR Digital Objects representing all kinds of digital assets like ' +
      'measurements, images, surveys, tables, or simulation data. Optionally, publication information and additional, custom attributes can be added to increase ' +
      'the FAIR score of the resulting FAIR Digital Object.',
    icon: '🗄️',
    modules: [
      { moduleId: 'core', selectable: false },
      { moduleId: 'dataobject', selectable: false },
      { moduleId: 'publication', selectable: true, defaultEnabled: true },
      { moduleId: 'additional', selectable: true, defaultEnabled: true },
      { moduleId: 'project', selectable: true, defaultEnabled: true },
    ],
  },
  {
    id: 'software',
    label: 'Software',
    description:
      'This template is recommended to create FAIR Digital Objects representing source code, workflows, tools, or scripts. ' +
      'Optionally, publication information and additional, custom attributes can be added to increase ' +
      'the FAIR score of the resulting FAIR Digital Object.',
    icon: '💻',
    modules: [
      { moduleId: 'core', selectable: false },
      { moduleId: 'software', selectable: false },
      { moduleId: 'publication', selectable: true, defaultEnabled: true },
      { moduleId: 'additional', selectable: true, defaultEnabled: true },
      { moduleId: 'project', selectable: true, defaultEnabled: true },
    ],
  },
  {
    id: 'publication',
    label: 'Publication',
    description:
      'This template is recommended to create FAIR Digital Objects representing scientific publications like ' +
      'journal articles, conference papers, or reports. Optionally, additional, custom attributes can be added to increase ' +
      'the FAIR score of the resulting FAIR Digital Object.',
    icon: '📚',
    modules: [
      { moduleId: 'core', selectable: false },
      { moduleId: 'publication', selectable: false },
      { moduleId: 'additional', selectable: true },
      { moduleId: 'project', selectable: true, defaultEnabled: true },
    ],
  },
];
