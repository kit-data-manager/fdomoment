import { useState, useRef, useCallback } from 'react';
import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent/types';
import { MiscEntry } from '@/lib/momentum/types';
import { TypedAttribute } from './types';

interface UseAdditionalAttributesProps {
  misc: { entries: MiscEntry[] };
  updateMisc: (entries: MiscEntry[]) => void;
}

export function useAdditionalAttributes({ misc, updateMisc }: UseAdditionalAttributesProps) {
  const [mode, setMode] = useState<'custom' | 'typed'>('custom');
  const [pendingAttribute, setPendingAttribute] = useState<{
    typeDef: TypeDefinition;
    value: any;
  } | null>(null);
  const typeRegistryRef = useRef<{ reset: () => void } | null>(null);

  // Get typed attributes from misc.entries
  const typedAttributes: TypedAttribute[] = misc.entries
    .filter((entry) => entry.attributeType === 'typed' && entry.typeDef)
    .map((entry) => ({
      id: entry.id,
      key: entry.key,
      typeDef: entry.typeDef!,
      value: entry.value,
    }));

  // Get custom attributes from misc.entries
  const customAttributes = misc.entries
    .filter((entry) => entry.attributeType === 'custom' || !entry.attributeType);

  const handleTypeSelect = useCallback((type: TypeDefinition, value: any) => {
    setPendingAttribute({
      typeDef: type,
      value,
    });
  }, []);

  const handleValueChange = useCallback((value: any) => {
    if (pendingAttribute) {
      setPendingAttribute({
        ...pendingAttribute,
        value,
      });
    }
  }, [pendingAttribute]);

  const addTypedAttribute = useCallback(() => {
    if (pendingAttribute) {
      const newEntry: MiscEntry = {
        id: crypto.randomUUID(),
        key: pendingAttribute.typeDef.name,
        value: pendingAttribute.value,
        attributeType: 'typed',
        isTyped: true,
        typeDef: pendingAttribute.typeDef,
      };
      updateMisc([...misc.entries, newEntry]);
      setPendingAttribute(null);
      
      if (typeRegistryRef.current) {
        typeRegistryRef.current.reset();
      }
    }
  }, [pendingAttribute, misc.entries, updateMisc]);

  const removeTypedAttribute = useCallback((id: string) => {
    updateMisc(misc.entries.filter((entry) => entry.id !== id));
  }, [misc.entries, updateMisc]);

  const getValidatorLabel = useCallback((validator: string) => {
    if (validator === 'JSON') return 'JSON Schema';
    if (validator === 'SPARQL') return 'SPARQL Query';
    return validator;
  }, []);

  return {
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
  };
}
