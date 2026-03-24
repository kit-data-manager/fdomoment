'use client';

import React, { useState, useRef } from 'react';
import { MiscMetadata, ResearchDomain } from '@/lib/momentum/types';
import { ModuleShell } from './ModuleShell';
import { KeyValueEditor } from '../ui/KeyValueEditor';
import { getSuggestedKeys } from '@/lib/momentum/constants';
import { SimpleTypeRegistryComponent } from '@/components/SimpleTypeRegistryComponent';
import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent/types';
import { Trash2 } from "lucide-react";

interface AdditionalAttributesModuleProps {
  misc: MiscMetadata;
  researchDomain: ResearchDomain | null;
  updateMisc: (entries: MiscMetadata['entries']) => void;
}

interface TypedAttribute {
  id: string;
  key: string;
  typeDef: TypeDefinition;
  value: any;
}

export function AdditionalAttributesModule({
  misc,
  researchDomain,
  updateMisc,
}: AdditionalAttributesModuleProps) {
  const [mode, setMode] = useState<'custom' | 'typed'>('custom');
  const [typedAttributes, setTypedAttributes] = useState<TypedAttribute[]>([]);
  const [pendingAttribute, setPendingAttribute] = useState<{
    typeDef: TypeDefinition;
    value: any;
  } | null>(null);
  const typeRegistryRef = useRef<{ reset: () => void } | null>(null);
  const suggestedKeys = getSuggestedKeys(researchDomain);

  const handleTypeSelect = (type: TypeDefinition, value: any) => {
    setPendingAttribute({
      typeDef: type,
      value,
    });
  };

  const handleValueChange = (value: any) => {
    if (pendingAttribute) {
      setPendingAttribute({
        ...pendingAttribute,
        value,
      });
    }
  };

  const addTypedAttribute = () => {
    if (pendingAttribute) {
      const newAttribute: TypedAttribute = {
        id: crypto.randomUUID(),
        key: pendingAttribute.typeDef.name,
        typeDef: pendingAttribute.typeDef,
        value: pendingAttribute.value,
      };
      setTypedAttributes([...typedAttributes, newAttribute]);
      setPendingAttribute(null);
      
      if (typeRegistryRef.current) {
        typeRegistryRef.current.reset();
      }
    }
  };

  const removeTypedAttribute = (id: string) => {
    setTypedAttributes(typedAttributes.filter((attr) => attr.id !== id));
  };

  const getValidatorLabel = (validator: string) => {
    if (validator === 'JSON') return 'JSON Schema';
    if (validator === 'SPARQL') return 'SPARQL Query';
    return validator;
  };

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
