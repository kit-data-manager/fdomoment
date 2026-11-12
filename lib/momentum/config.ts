/**
 * Configuration-driven module & property system.
 *
 * This file defines the *schema* used to declare modules, properties and
 * templates purely by configuration (static TypeScript, for now). The sections
 * below describe re-usable building blocks:
 *
 *  - PropertyConfig      : a single editable attribute (with its widget + validation)
 *  - ModuleConfig        : a collection of properties forming one module
 *  - TemplateDefinition  : a combination of modules forming a user-facing template
 *
 * The system supports two kinds of modules:
 *  - "generic" modules  : fully described by their PropertyConfig list. They are
 *                         rendered by <GenericModule> without any hand-written UI.
 *  - "custom" (specialized) modules : modules that carry complex behavior (auto-import,
 *                         ORCiD lookups, typed attribute registries...). They still
 *                         declare a ModuleConfig for registration / validation /
 *                         record-building metadata, but provide their own component.
 */

/** Metrics contributing to the FAIR score. */
export interface FairScoreContribution {
  findable?: number;
  accessible?: number;
  interoperable?: number;
  reusable?: number;
}

/** Built-in widget kinds that GenericModule / PropertyField can render declaratively. */
export type PropertyKind =
  | 'text'
  | 'url'
  | 'email'
  | 'select'
  | 'multi-select'
  | 'boolean'
  | 'orcid';

/** Declarative validation applicable to a property. */
export type PropertyValidation =
  | { type: 'regex'; pattern: string; message?: string }
  | { type: 'url'; message?: string }
  | { type: 'email'; message?: string }
  | { type: 'orcid'; message?: string }
  | { type: 'required-only'; message?: string };

/** Single option for select-like property kinds. */
export interface PropertyOption {
  id: string;
  label: string;
  hint?: string;
  category?: string;
}

/** The value kept in editor state for a configured property. */
export type PropertyValuePrimitive = string | boolean | number | null;

/**
 * Declares a single editable attribute.
 *
 * - Generic kinds (text / url / email / select / boolean / orcid) are rendered and
 *   validated automatically.
 * - A `customWidgetId` may be supplied to delegate rendering to a registered custom
 *   widget implementation (escape hatch for complex attributes).
 */
export interface PropertyConfig {
  id: string;
  label: string;
  kind: PropertyKind;
  required: boolean;
  hint?: string;
  placeholder?: string;
  options?: PropertyOption[];
  validation?: PropertyValidation;
  affectsFairScore?: FairScoreContribution;
  /** Optional FDO type identifier used when assembling the final record. */
  fdoType?: string;
  /** Delegates rendering to a registered custom widget (escape hatch). */
  customWidgetId?: string;
  /** When present, options / defaults are derived from another module's properties. */
  dependsOn?: {
    moduleId: string;
    propertyId: string;
    /** Resolves a hint option relevant to this property. */
    source: 'options' | 'value';
  };
}

/** A single editable property alongside its current value (runtime state). */
export interface PropertyStateValue {
  value: PropertyValuePrimitive;
  status: 'none' | 'pending' | 'valid' | 'invalid';
  message?: string;
}

/** Collection of property values for one module (generic module runtime state). */
export type PropertiesState = Record<string, PropertyStateValue>;

/** Role of a module within a FAIR Digital Object. */
export type ModuleRole = 'core' | 'enrichment';

/**
 * Declares a single module purely by configuration.
 *
 * - `kind: 'generic'`  -> rendered by <GenericModule> from `properties`.
 * - `kind: 'custom'`   -> rendered by a paired custom component registered in the
 *                         module registry; `properties` still used for status/FAIR
 *                         score/record-building metadata where applicable.
 */
export interface ModuleConfig {
  id: string;
  label: string;
  description: string;
  icon?: string;
  role: ModuleRole;
  kind: 'generic' | 'custom';
  /** Custom component id (only meaningful when kind === 'custom'). */
  componentId?: string;
  /** Properties for generic modules; metadata/status reference for custom modules. */
  properties?: PropertyConfig[];
  /** Allows a custom module to declare its own status function id. */
  statusId?: string;
}

/** A template referencing one or more modules. */
export interface TemplateDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  modules: { moduleId: string; selectable: boolean; defaultEnabled?: boolean }[];
  /** Explicit visit order. When omitted, module config order is used (core first). */
  stepOrder?: string[];
}
