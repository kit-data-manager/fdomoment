import { useState, useRef, useCallback } from 'react';
import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent/types';
import { MiscEntry } from '@/lib/momentum/types';
import { TypedAttribute } from './types';
import { SimpleTypeRegistryRef } from '@/components/SimpleTypeRegistryComponent';

interface UseAdditionalAttributesProps {
  misc: { entries: MiscEntry[] };
  updateMisc: (entries: MiscEntry[]) => void;
}

export function useAdditionalAttributes({ misc, updateMisc }: UseAdditionalAttributesProps) {
  const [mode, setMode] = useState<'custom' | 'typed'>('typed');
  const [pendingAttribute, setPendingAttribute] = useState<{
    typeDef: TypeDefinition;
    value: any;
  } | null>(null);
  const typeRegistryRef = useRef<SimpleTypeRegistryRef | null>(null);

  // Get typed attributes from misc.entries
  const typedAttributes: TypedAttribute[] = misc.entries
    .filter((entry) => entry.attributeType === 'typed' && entry.typeDef)
    .map((entry) => ({
      id: entry.id,
      key: entry.key,
      typeDef: entry.typeDef!,
      value: entry.value,
    }));

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

  const clearPendingAttribute = useCallback(() => {
    setPendingAttribute(null);
    // Clear selection for LINK validator if needed
    if (pendingAttribute?.typeDef.validator === 'LINK') {
      typeRegistryRef.current?.reset();
    }
  }, [pendingAttribute]);

  const resetSelectionInternal = useCallback(() => {
    setPendingAttribute(null);
    typeRegistryRef.current?.reset();
  }, []);

  const addTypedAttribute = useCallback(() => {
    if (pendingAttribute) {
      let value = pendingAttribute.value;
      
      // Accept selection for LINK validator first to get the selected PID
      if (pendingAttribute.typeDef.validator === 'LINK') {
        const selectedPid = typeRegistryRef.current?.acceptSelection();
        if (selectedPid) {
          value = selectedPid;
        }
      }
      
      const newEntry: MiscEntry = {
        id: crypto.randomUUID(),
        key: pendingAttribute.typeDef.name,
        value,
        attributeType: 'typed',
        isTyped: true,
        typeDef: pendingAttribute.typeDef,
      };
      updateMisc([...misc.entries, newEntry]);
      setPendingAttribute(null);
      resetSelectionInternal();
    }
  }, [pendingAttribute, misc.entries, updateMisc, resetSelectionInternal]);

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
    clearPendingAttribute,
    resetSelectionInternal,
  };
}
