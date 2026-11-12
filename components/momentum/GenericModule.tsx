'use client';

import React from 'react';
import { ModuleConfig, PropertiesState, PropertyStateValue } from '@/lib/momentum/config';
import { ModuleShell } from './ModuleShell';
import { NavigationButtons } from './ui/NavigationButtons';
import { PropertyField } from './PropertyField';

export interface GenericModuleProps {
  config: ModuleConfig;
  /** Property state for this module (keyed by property id). */
  properties: PropertiesState;
  onPropertyChange: (propertyId: string, value: PropertyStateValue) => void;
  /** Optional extra suggestion options per property (re-used from other modules). */
  quickOptions?: Record<string, { id: string; label: string; hint?: string; category?: string }[]>;
  showNext?: boolean;
  showPrev?: boolean;
  onNextModule?: () => void;
  onPrevModule?: () => void;
}

/**
 * Renders any "generic" (declarative) module from its ModuleConfig. Each configured
 * property is rendered via <PropertyField>, wrapped in the standard ModuleShell and
 * NavigationButtons. This is how new config-defined modules get a complete,
 * validated, navigable UI without hand-written components.
 */
export function GenericModule({
  config,
  properties,
  onPropertyChange,
  quickOptions,
  showNext = true,
  showPrev = false,
  onNextModule,
  onPrevModule,
}: GenericModuleProps) {
  const propertyList = config.properties ?? [];

  return (
    <ModuleShell title={`${config.icon ?? ''} ${config.label}`.trim()} badge={config.role === 'core' ? 'required' : 'optional'}>
      {config.description && (
        <div className="alert alert-soft mb-4">
          <span className="text-xs">{config.description}</span>
        </div>
      )}
      <div className="space-y-6">
        {propertyList.map((prop) => (
          <PropertyField
            key={prop.id}
            property={prop}
            value={properties[prop.id] ?? { value: null, status: 'none' }}
            quickOptions={quickOptions?.[prop.id]}
            onChange={(v) => onPropertyChange(prop.id, v)}
          />
        ))}
      </div>

      <NavigationButtons
        showPrev={showPrev}
        showNext={showNext}
        onPrev={onPrevModule}
        onNext={onNextModule}
      />
    </ModuleShell>
  );
}
