'use client';

import React from 'react';
import { ModuleShell } from '../ModuleShell';
import { KeyValueEditor } from '../ui/KeyValueEditor';
import { getSuggestedKeys } from '@/lib/momentum/constants';
import { SimpleTypeRegistryComponent } from '@/components/SimpleTypeRegistryComponent';
import { Trash2 } from "lucide-react";
import { useAdditionalAttributes } from './useAdditionalAttributes';
import { AdditionalAttributesModuleProps } from './types';

export function AdditionalAttributesModule({
  misc,
  researchDomain,
  updateMisc,
}: AdditionalAttributesModuleProps) {
  const {
    mode,
    setMode,
    typedAttributes,
    pendingAttribute,
    typeRegistryRef,
    handleTypeSelect,
    handleValueChange,
    addTypedAttribute,
    removeTypedAttribute,
    getValidatorLabel,
  } = useAdditionalAttributes();

  const suggestedKeys = getSuggestedKeys(researchDomain);

  return (
    <ModuleShell
      title="🔧 Additional Metadata"
      badge="optional"
    >
      <div className="space-y-4">
        <div className="tabs tabs-boxed">
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`tab ${mode === 'custom' ? 'tab-active' : ''}`}
          >
            Custom Attributes
          </button>
          <button
            type="button"
            onClick={() => setMode('typed')}
            className={`tab ${mode === 'typed' ? 'tab-active' : ''}`}
          >
            Typed Attributes
          </button>
        </div>

        {mode === 'custom' && (
          <div>
            <p className="text-sm text-base-content/70 mb-4">
              Add custom key-value pairs for additional metadata.
            </p>
            <KeyValueEditor
              entries={misc.entries}
              onChange={updateMisc}
              suggestedKeys={suggestedKeys}
            />
          </div>
        )}

        {mode === 'typed' && (
          <div className="space-y-4">
            <p className="text-sm text-base-content/70">
              Select from predefined attribute types with validators (JSON Schema or SPARQL).
            </p>
            
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <SimpleTypeRegistryComponent
                  onTypeSelect={handleTypeSelect}
                  onValueChange={handleValueChange}
                />
                
                {pendingAttribute && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={addTypedAttribute}
                      className="btn btn-primary btn-sm"
                    >
                      Add Typed Attribute
                    </button>
                  </div>
                )}
              </div>
            </div>

            {typedAttributes.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-medium text-sm">Added Typed Attributes:</h4>
                {typedAttributes.map((attr) => (
                  <div key={attr.id} className="card bg-base-100 border border-base-200">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{attr.key}</div>
                          <div className="text-xs text-base-content/70">
                            Validator: {getValidatorLabel(attr.typeDef.validator)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeTypedAttribute(attr.id)}
                          className="btn btn-ghost btn-sm"
                        >
                          <Trash2 width="16" height="16" />
                        </button>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Value:</span>
                        <pre className="bg-base-200 rounded p-2 mt-1 text-xs overflow-auto">
                          {JSON.stringify(attr.value, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {typedAttributes.length === 0 && !pendingAttribute && (
              <div className="alert alert-info">
                <span className="text-sm">
                  Select a type above and click "Add Typed Attribute" to add it to your metadata.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
