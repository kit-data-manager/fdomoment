/**
 * Module definitions (static configuration).
 *
 * The five built-in modules are declared here with their presentation metadata,
 * role, status-computation reference and (for the declarative sample module) full
 * property lists. New modules can be added here purely by configuration:
 *
 *   - For a "generic" module: provide `properties` (each rendered + validated by
 *     GenericModule/PropertyField automatically). It immediately integrates with
 *     templates, navigation, FAIR scoring and record building.
 *   - For a "custom" (specialized) module: provide `componentId`. The component is
 *     dispatched by the editor (see EditorShell) and computes its own status.
 */
import { ModuleConfig } from './config';
import { FDO_PROFILES } from '@/lib/fdo/identifiers';

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'core',
    label: 'Core',
    description: 'Core module mandatory for all FAIR Digital Objects.',
    icon: '📋',
    role: 'core',
    kind: 'custom',
    componentId: 'Core',
    profile: FDO_PROFILES.CORE,
  },
  {
    id: 'dataobject',
    label: 'Data Object',
    description: 'Data object module for research data-focused FAIR Digital Objects.',
    icon: '🗄️',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'DataObject',
    profile: FDO_PROFILES.DATA_OBJECT,
  },
  {
    id: 'software',
    label: 'Software',
    description: 'Software module for research software-focused FAIR Digital Objects.',
    icon: '💻',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'Software',
    profile: FDO_PROFILES.SOFTWARE,
  },
  {
    id: 'publication',
    label: 'Publication',
    description: 'Publication module for scientific publication-focused FAIR Digital Objects or for additional publication information.',
    icon: '📚',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'Publication',
    profile: FDO_PROFILES.PUBLICATION,
  },
  {
    id: 'additional',
    label: 'Additional Metadata',
    description: 'Module for adding additional, freely definable attributes to FAIR Digital Objects.',
    icon: '🔧',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'AdditionalMetadata',
    profile: FDO_PROFILES.ADDITIONAL_METADATA,
  },
];

/**
 * Demonstration of how a *new* module can be added purely by configuration.
 * It is a "generic" module: every property listed here is rendered, validated,
 * scored and folded into the final FAIR Digital Object automatically.
 *
 * Per the project conventions, all module properties are mandatory (required).
 * Optional / freely definable attributes belong to the "Additional Metadata"
 * module instead of being added here.
 */
export const SAMPLE_MODULE_CONFIG: ModuleConfig = {
  id: 'project',
  label: 'Project',
  description: 'Project module to attach the funding project context to a FAIR Digital Object.',
  icon: '🧩',
  role: 'enrichment',
  kind: 'generic',
  profile: FDO_PROFILES.PROJECT,
  properties: [
    {
      id: 'projectName',
      label: 'Project Name',
      required: true,
      kind: 'text',
      placeholder: 'e.g. Helmholtz AI',
      affectsFairScore: { findable: 10, reusable: 10 },
      fdoType: '0.SIMPLE/PROJECT_NAME',
    },
    {
      id: 'funder',
      label: 'Funder',
      required: true,
      kind: 'select',
      options: [
        { id: 'helmholtz', label: 'Helmholtz Association' },
        { id: 'dfg', label: 'DFG' },
        { id: 'eu', label: 'European Union' },
        { id: 'other', label: 'Other' },
      ],
      affectsFairScore: { reusable: 10 },
      fdoType: '0.SIMPLE/PROJECT_FUNDER',
    },
  ],
};

/** All modules known to the system (built-ins + sample declarative module). */
export const COMPLETE_MODULE_CONFIGS: ModuleConfig[] = [
  ...MODULE_CONFIGS,
  SAMPLE_MODULE_CONFIG,
];
