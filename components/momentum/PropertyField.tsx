'use client';

import React from 'react';
import { PropertyConfig, PropertyStateValue } from '@/lib/momentum/config';
import { ValidatedInput } from './ui/ValidatedInput';
import { SearchableSelect } from './ui/SearchableSelect';
import { validatePropertyConfig } from '@/lib/momentum/registry';

export interface PropertyFieldProps {
  property: PropertyConfig;
  value: PropertyStateValue;
  onChange: (value: PropertyStateValue) => void;
  /** Optional extra suggestion options (e.g. from a related module). */
  quickOptions?: { id: string; label: string; hint?: string; category?: string }[];
}

/**
 * Renders a single configured property using a reusable widget, wires up
 * declarative validation, and reports the resulting validation state.
 *
 * Used by <GenericModule> to render config-defined attributes without any
 * hand-written UI. The kind of widget is chosen by `property.kind`.
 */
export function PropertyField({ property, value, onChange, quickOptions }: PropertyFieldProps) {
  const { value: currentValue, status, message } = value;

  // Keep validation state in sync when the value changes (called by each widget).
  const changeHandler = (next: PropertyStateValue) => {
    onChange(next);
  };

  const updateFromString = (strVal: string) => {
    const resolved = validatePropertyConfig(property, strVal);
    changeHandler({ value: strVal, status: resolved.status, message: resolved.message });
  };

  const updateFromBoolean = (boolVal: boolean) => {
    // Booleans pass "true"/"1" as valid values.
    const strVal = boolVal ? 'true' : 'false';
    const resolved = validatePropertyConfig(property, strVal);
    changeHandler({ value: boolVal, status: resolved.status, message: resolved.message });
  };

  const updateFromSelect = (id: string, label?: string) => {
    // Keep the option id as value but validate based on non-empty selection.
    const resolved = validatePropertyConfig(property, id);
    changeHandler({ value: id, status: resolved.status, message: resolved.message });
  };

  switch (property.kind) {
    case 'text':
    case 'url':
    case 'email':
    case 'orcid':
      return (
        <ValidatedInput
          label={property.label}
          required={property.required}
          type={property.kind === 'url' ? 'url' : property.kind === 'email' ? 'email' : 'text'}
          value={currentValue == null ? '' : String(currentValue)}
          onChange={updateFromString}
          placeholder={property.placeholder}
          hint={property.hint}
          validationState={status as any}
          validationMessage={message}
        />
      );

    case 'boolean':
      return (
        <div className="w-full">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox"
              checked={currentValue === true || currentValue === 'true'}
              onChange={(e) => updateFromBoolean(e.target.checked)}
            />
            <span className="label-text font-medium">
              {property.label}
              {property.required && <span className="text-error ml-1">*</span>}
            </span>
          </label>
          {property.hint && (
            <label className="label">
              <span className="label-text-alt text-base-content/70">{property.hint}</span>
            </label>
          )}
        </div>
      );

    case 'multi-select':
      return (
        <ValidatedInput
          label={property.label}
          required={property.required}
          value={currentValue == null ? '' : String(currentValue)}
          onChange={updateFromString}
          placeholder={property.placeholder ?? 'Comma-separated values'}
          hint={property.hint}
          validationState={status as any}
          validationMessage={message}
        />
      );

    case 'select':
    default:
      return (
        <SearchableSelect
          label={property.label}
          required={property.required}
          options={property.options ?? []}
          value={currentValue == null ? null : String(currentValue)}
          onChange={(option) => updateFromSelect(option.id, option.label)}
          placeholder={property.placeholder ?? 'Please select...'}
          hint={property.hint}
          quickOptions={quickOptions}
        />
      );
  }
}
