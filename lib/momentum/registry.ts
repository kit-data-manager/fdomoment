/**
 * Module / template registry.
 *
 * Central, configuration-driven lookups used across the application. Both the
 * FAIR DO creation (momentum) view and the FAIR DO viewing (memento) view can rely
 * on these helpers. The registry turns the static configs in ./modules and
 * ./templates into a single source of truth for:
 *
 *  - module labels / descriptions / icons / roles
 *  - declarative (generic) module property rendering + validation + FAIR score
 *  - template selection and step ordering
 *  - record building for the final FAIR Digital Object
 */
import {
  ModuleConfig,
  PropertyConfig,
  TemplateDefinition,
  ModuleRole,
  PropertiesState,
  PropertyStateValue,
} from './config';
import { COMPLETE_MODULE_CONFIGS } from './modules';
import { TEMPLATE_DEFINITIONS } from './templates';
import { validateOrcidFormat } from './validation';

export type ModuleStatusLike = 'pristine' | 'incomplete' | 'complete';

const moduleConfigsById: Record<string, ModuleConfig> = {};
for (const cfg of COMPLETE_MODULE_CONFIGS) {
  moduleConfigsById[cfg.id] = cfg;
}

const templateConfigsById: Record<string, TemplateDefinition> = {};
for (const tpl of TEMPLATE_DEFINITIONS) {
  templateConfigsById[tpl.id] = tpl;
}

export function getModuleConfig(id: string): ModuleConfig | undefined {
  return moduleConfigsById[id];
}

export function getModuleLabel(id: string): string {
  return moduleConfigsById[id]?.label ?? id;
}

export function getModuleDescription(id: string): string {
  return moduleConfigsById[id]?.description ?? '';
}

export function getModuleRole(id: string): ModuleRole {
  return moduleConfigsById[id]?.role ?? 'enrichment';
}

export function isCoreModule(id: string): boolean {
  return getModuleRole(id) === 'core';
}

/**
 * Ordered list of all known module ids. Used as the default fallback ordering for
 * navigation (core first, then in config order).
 */
export function getDefaultModuleOrder(): string[] {
  const core = COMPLETE_MODULE_CONFIGS.filter((m) => m.role === 'core').map((m) => m.id);
  const enrichment = COMPLETE_MODULE_CONFIGS
    .filter((m) => m.role !== 'core')
    .map((m) => m.id);
  return [...new Set([...core, ...enrichment])];
}

/** Ordered list of the steps for a template (defaults to config order, core first). */
export function getStepOrder(templateId: string): string[] {
  const tpl = templateConfigsById[templateId];
  if (!tpl) return getDefaultModuleOrder();
  if (tpl.stepOrder && tpl.stepOrder.length > 0) {
    return tpl.stepOrder;
  }
  // Fall back to config order but ensure core is first.
  const ordered = tpl.modules.map((m) => m.moduleId);
  const core = ordered.find((id) => isCoreModule(id));
  const rest = ordered.filter((id) => !isCoreModule(id));
  return core ? [core, ...rest] : ordered;
}

/** Resolve the module ids the editor should step through for a given template. */
export function getTemplateModuleIds(templateId: string): string[] {
  const tpl = templateConfigsById[templateId];
  return tpl ? tpl.modules.map((m) => m.moduleId) : [];
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Validate a single property value against its declarative config.
 * Returns the desired validation state + message.
 */
export function validatePropertyConfig(prop: PropertyConfig, value: any): { status: 'none' | 'valid' | 'invalid'; message?: string } {
  const stringValue = value == null ? '' : String(value);

  // Empty handling.
  if (stringValue.length === 0) {
    if (prop.required) {
      return { status: 'invalid', message: prop.validation && 'message' in prop.validation ? (prop.validation as any).message : `"${prop.label}" is required.` };
    }
    return { status: 'none' };
  }

  if (!prop.validation) {
    // No explicit validation -> treat a URL kind as requiring URL validity.
    if (prop.kind === 'url') {
      return isValidUrl(stringValue) ? { status: 'valid' } : { status: 'invalid', message: 'Please provide a valid URL.' };
    }
    if (prop.kind === 'email') {
      return isValidEmail(stringValue) ? { status: 'valid' } : { status: 'invalid', message: 'Please provide a valid email address.' };
    }
    return { status: 'valid' };
  }

  const v = prop.validation;
  switch (v.type) {
    case 'required-only':
      return stringValue.length > 0 ? { status: 'valid' } : { status: 'invalid', message: v.message };
    case 'regex':
      try {
        return new RegExp(v.pattern).test(stringValue)
          ? { status: 'valid' }
          : { status: 'invalid', message: v.message ?? 'Invalid value.' };
      } catch {
        return { status: 'valid' };
      }
    case 'url':
      return isValidUrl(stringValue) ? { status: 'valid' } : { status: 'invalid', message: v.message ?? 'Please provide a valid URL.' };
    case 'email':
      return isValidEmail(stringValue) ? { status: 'valid' } : { status: 'invalid', message: v.message ?? 'Please provide a valid email address.' };
    case 'orcid':
      return validateOrcidFormat(stringValue)
        ? { status: 'valid' }
        : { status: 'invalid', message: v.message ?? 'Invalid ORCiD format.' };
    default:
      return { status: 'valid' };
  }
}

/**
 * Compute the status of a module from its config.
 *
 * For generic modules the status is derived from the required property states.
 * (Specialized modules compute their own status via the legacy validation
 * helpers on the hook side and are not routed through here.)
 */
export function computeModuleStatus(moduleId: string, data: any): ModuleStatusLike {
  const cfg = moduleConfigsById[moduleId];
  if (!cfg) return 'incomplete';

  const props = cfg.properties;
  if (!props || props.length === 0) return 'complete';

  const states: PropertiesState = data?.properties ?? data ?? {};
  const requiredValues = props
    .filter((p) => p.required)
    .map((p) => states[p.id]?.value);

  if (requiredValues.length > 0 && requiredValues.every((v) => v == null || String(v).length === 0)) {
    return 'pristine';
  }

  // Evaluate each declared property.
  let anyTouched = false;
  let allComplete = true;
  for (const prop of props) {
    if (!prop.required) continue;
    const st: PropertyStateValue | undefined = states[prop.id];
    const raw = st?.value;
    if (raw != null && String(raw).length > 0) {
      anyTouched = true;
      const res = validatePropertyConfig(prop, raw);
      if (res.status !== 'valid') {
        allComplete = false;
      }
    } else {
      anyTouched = true; // touched but empty required field
      allComplete = false;
    }
  }

  if (!anyTouched) return 'pristine';
  return allComplete ? 'complete' : 'incomplete';
}

/**
 * Sum FAIR-score contributions declared by properties of the given enabled modules.
 * `enabledModules` restricts which module data is considered.
 */
export function computeModuleFairScoreContributions(
  enabledModules: string[],
  data: Record<string, any>
): { findable: number; accessible: number; interoperable: number; reusable: number } {
  const acc = { findable: 0, accessible: 0, interoperable: 0, reusable: 0 };

  for (const moduleId of enabledModules) {
    const cfg = moduleConfigsById[moduleId];
    if (!cfg || !cfg.properties) continue;
    const states: PropertiesState = data[moduleId]?.properties ?? data[moduleId] ?? {};
    for (const prop of cfg.properties) {
      const st = states[prop.id];
      const raw = st?.value;
      if (raw == null || String(raw).length === 0) continue;
      if (!prop.affectsFairScore) continue;
      const res = validatePropertyConfig(prop, raw);
      if (res.status !== 'valid') continue;
      acc.findable += prop.affectsFairScore.findable ?? 0;
      acc.accessible += prop.affectsFairScore.accessible ?? 0;
      acc.interoperable += prop.affectsFairScore.interoperable ?? 0;
      acc.reusable += prop.affectsFairScore.reusable ?? 0;
    }
  }

  return acc;
}

/**
 * Fold declared generic-module properties into the final FDO record.
 * Specialized modules provide their own record collector (handled by EditorShell).
 */
export function collectConfigRecordEntries(
  moduleId: string,
  moduleData: any,
  addEntry: (key: string, value: any) => void
): void {
  const cfg = moduleConfigsById[moduleId];
  if (!cfg || cfg.kind !== 'generic' || !cfg.properties) return;
  const states: PropertiesState = moduleData?.properties ?? moduleData ?? {};
  for (const prop of cfg.properties) {
    if (!prop.fdoType) continue;
    const raw = states[prop.id]?.value;
    if (raw == null || String(raw).length === 0) continue;
    addEntry(prop.fdoType, raw);
  }
}
