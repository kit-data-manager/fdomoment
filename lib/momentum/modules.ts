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
 *   - For a "custom" (specialized) module: provide `componentId` and optionally a
 *     `statusId` / record-collector id, then register the component in the registry.
 */
import { ModuleConfig } from './config';

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'core',
    label: 'Core',
    description: 'Core module mandatory for all FAIR Digital Objects.',
    icon: '📋',
    role: 'core',
    kind: 'custom',
    componentId: 'Core',
    statusId: 'core',
  },
  {
    id: 'dataobject',
    label: 'Data Object',
    description: 'Data object module for research data-focused FAIR Digital Objects.',
    icon: '🗄️',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'DataObject',
    statusId: 'dataobject',
  },
  {
    id: 'software',
    label: 'Software',
    description: 'Software module for research software-focused FAIR Digital Objects.',
    icon: '💻',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'Software',
    statusId: 'software',
  },
  {
    id: 'publication',
    label: 'Publication',
    description: 'Publication module for scientific publication-focused FAIR Digital Objects or for additional publication information.',
    icon: '📚',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'Publication',
    statusId: 'publication',
  },
  {
    id: 'additional',
    label: 'Additional Metadata',
    description: 'Module for adding additional, freely definable attributes to FAIR Digital Objects.',
    icon: '🔧',
    role: 'enrichment',
    kind: 'custom',
    componentId: 'AdditionalMetadata',
    statusId: 'additional',
  },
];

/**
 * Demonstration of how a *new* module can be added purely by configuration.
 * It is a "generic" module: every property listed here is rendered, validated,
 * scored and folded into the final FAIR Digital Object automatically.
 *
 * NOTE: Intentionally declared as a separate array so it is trivial to remove or
 * flag off. It is referenced by a sample template and the cross-module option
 * topic (so both the generic module and re-usable property catalog are exercised).
 */
export const SAMPLE_MODULE_CONFIG: ModuleConfig = {
  id: 'project',
  label: 'Project',
  description: 'Project module to attach project-level context to a FAIR Digital Object.',
  icon: '🧩',
  role: 'enrichment',
  kind: 'generic',
  properties: [
    {
      id: 'projectName',
      label: 'Project Name',
      required: false,
      kind: 'text',
      placeholder: 'e.g. Helmholtz AI',
      affectsFairScore: { findable: 10, reusable: 10 },
      fdoType: '0.SIMPLE/PROJECT_NAME',
    },
    {
      id: 'projectId',
      label: 'Project Identifier',
      required: false,
      kind: 'select',
      options: [
        { id: 'from-publication', label: 'From publication (re-use)' },
        { id: 'from-dataobject', label: 'From data object (re-use)' },
        { id: 'helmholtz-ai', label: 'Helmholtz AI' },
        { id: 'helmholtz-imaging', label: 'Helmholtz Imaging' },
      ],
      dependsOn: {
        moduleId: 'core',
        propertyId: 'researchDomain',
        source: 'value',
      },
      affectsFairScore: { findable: 10 },
      fdoType: '0.SIMPLE/PROJECT_ID',
    },
    {
      id: 'grantedBy',
      label: 'Granted by',
      required: false,
      kind: 'select',
      options: [
        { id: 'helmholtz', label: 'Helmholtz Association' },
        { id: 'dfg', label: 'DFG' },
        { id: 'eu', label: 'European Union' },
        { id: 'other', label: 'Other' },
      ],
      affectsFairScore: { reusable: 10 },
      fdoType: '0.SIMPLE/PROJECT_GRANTEE',
    },
  ],
};

/** All modules known to the system (built-ins + sample declarative module). */
export const COMPLETE_MODULE_CONFIGS: ModuleConfig[] = [
  ...MODULE_CONFIGS,
  SAMPLE_MODULE_CONFIG,
];
