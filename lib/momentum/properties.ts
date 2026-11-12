/**
 * Reusable property catalog.
 *
 * These are pre-configured, re-usable PropertyConfig entries. Modules can reference
 * them by spreading the entry (and, if needed, overriding bits such as `required`
 * or `placeholder`). This makes it possible to re-use the *same* property (e.g.
 * "license") across multiple modules without duplicating its widget + validation
 * configuration.
 */
import { PropertyConfig } from './config';

export const TEXT_PROPERTY: PropertyConfig = {
  id: 'text',
  label: 'Text',
  kind: 'text',
  required: false,
};

/** A required URL property with reachability validation surfaced to the UI. */
export const URL_PROPERTY: PropertyConfig = {
  id: 'url',
  label: 'URL',
  kind: 'url',
  required: false,
  validation: { type: 'url', message: 'Please provide a valid URL.' },
};

/** A boolean / checkbox property. */
export const BOOLEAN_PROPERTY: PropertyConfig = {
  id: 'boolean',
  label: 'Flag',
  kind: 'boolean',
  required: false,
};

/**
 * Build a select property from a static option list.
 * Used to declare single-choice attributes declaratively.
 */
export function selectProperty(partial: Partial<PropertyConfig> & Pick<PropertyConfig, 'id' | 'label' | 'options'>): PropertyConfig {
  return {
    kind: 'select',
    required: false,
    ...partial,
  };
}

/**
 * Build a text property. Convenience for declaring free-text attributes.
 */
export function textProperty(partial: Partial<PropertyConfig> & Pick<PropertyConfig, 'id' | 'label'>): PropertyConfig {
  return {
    kind: 'text',
    required: false,
    ...partial,
  };
}

/**
 * Build a URL property. Convenience for declaring URL attributes.
 */
export function urlProperty(partial: Partial<PropertyConfig> & Pick<PropertyConfig, 'id' | 'label'>): PropertyConfig {
  return {
    kind: 'url',
    required: false,
    ...partial,
    validation: partial.validation ?? { type: 'url', message: 'Please provide a valid URL.' },
  };
}

/**
 * Constant list of the currently available property builders, kept here as a
 * light-weight reference / index for tooling (not strictly required at runtime).
 */
export const PROPERTY_TYPES = {
  text: textProperty,
  select: selectProperty,
  url: urlProperty,
  boolean: (p: Partial<PropertyConfig> & Pick<PropertyConfig, 'id' | 'label'>) =>
    ({ kind: 'boolean' as const, required: false, ...p } as PropertyConfig),
} as const;
