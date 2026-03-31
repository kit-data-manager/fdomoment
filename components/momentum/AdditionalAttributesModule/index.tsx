'use client';

import React from 'react';
import { ModuleShell } from '../ModuleShell';
import { KeyValueEditor } from '../ui/KeyValueEditor';
import { getSuggestedKeys } from '@/lib/momentum/constants';
import { SimpleTypeRegistryComponent } from '@/components/SimpleTypeRegistryComponent';
import { NavigationButtons } from '../ui/NavigationButtons';
import { Trash2 } from "lucide-react";
import { useAdditionalAttributes } from './useAdditionalAttributes';
import { AdditionalAttributesModuleProps } from './types';

export function AdditionalAttributesModule({
  misc,
  researchDomain,
  updateMisc,
  showNext = false,
  showPrev = false,
  onNextModule,
  onPrevModule,
}: AdditionalAttributesModuleProps) {
  const {
    mode,
    setMode,
    typedAttributes,
    pendingAttribute,
    handleTypeSelect,
    handleValueChange,
    addTypedAttribute,
    removeTypedAttribute,
    getValidatorLabel,
    clearPendingAttribute,
  } = useAdditionalAttributes({ misc, updateMisc });

  const suggestedKeys = getSuggestedKeys(researchDomain);

  return (
      <ModuleShell
          title="🔧 Additional Metadata"
          badge="optional"
      >
        <div className="alert alert-soft mb-4">
                <span className="text-xs">
                  Additional attributes allow you to further customize your FAIR Digital Object. You may add
                  typed attributes selected from a searchable list, or custom attributes, either from a list or
                  by adding own key-value-pairs.
                  <br/><br/>
                    💡 Depending on the selected Research Domain, there may be suggested custom attributes available.
                </span>
        </div>
        <div className="space-y-4">
          <div className="tabs tabs-border">
            <button
                type="button"
                onClick={() => setMode('typed')}
                className={`tab ${mode === 'typed' ? 'tab-active' : ''}`}
            >
              Typed Attributes
            </button>
            <button
                type="button"
                onClick={() => setMode('custom')}
                className={`tab ${mode === 'custom' ? 'tab-active' : ''}`}
            >
              Custom Attributes
            </button>
          </div>

          {mode === 'custom' && (
              <div>
                <KeyValueEditor
                    entries={misc.entries}
                    onChange={updateMisc}
                    suggestedKeys={suggestedKeys}
                />
              </div>
          )}

          {mode === 'typed' && (
              <div className="space-y-4">
                    <SimpleTypeRegistryComponent
                        onTypeSelect={handleTypeSelect}
                        onValueChange={handleValueChange}
                        onReset={clearPendingAttribute}
                    />

                    {pendingAttribute && (
                        <div className="mt-4 flex justify-end">
                          <button
                              type="button"
                              onClick={addTypedAttribute}
                              className="btn btn-soft btn-primary btn-sm"
                          >
                            Add Typed Attribute
                          </button>
                        </div>
                    )}
                <h4 className="font-medium text-sm">Typed Attributes:</h4>
                <div className="card bg-base-200 border border-base-200 p-4 gap-2">
                  {typedAttributes.length == 0 && (
                      <p className="text-sm font-medium text-gray-500">No typed attributes, yet.</p>
                  )}

                  {typedAttributes.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {typedAttributes.map((attr) => (
                            <div key={attr.id} className="card bg-base-200 border border-base-200">
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
                                    <Trash2 width="16" height="16"/>
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
                </div>
              </div>
          )}
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
