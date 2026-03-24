import { useState, useRef, useCallback } from 'react';
import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent/types';
import { TypedAttribute } from './types';

export function useAdditionalAttributes() {
  const [mode, setMode] = useState<'custom' | 'typed'>('custom');
  const [typedAttributes, setTypedAttributes] = useState<TypedAttribute[]>([]);
  const [pendingAttribute, setPendingAttribute] = useState<{
    typeDef: TypeDefinition;
    value: any;
  } | null>(null);
  const typeRegistryRef = useRef<{ reset: () => void } | null>(null);

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
  }, [pendingAttribute, typedAttributes]);

  const removeTypedAttribute = useCallback((id: string) => {
    setTypedAttributes(typedAttributes.filter((attr) => attr.id !== id));
  }, [typedAttributes]);

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
