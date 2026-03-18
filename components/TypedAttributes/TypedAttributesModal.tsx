import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TypeDefinition } from '@/components/SimpleTypeRegistryComponent';
import SimpleTypeRegistryComponent from '@/components/SimpleTypeRegistryComponent';
import { TypedAttributesItem } from './types';

interface TypedPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: TypedAttributesItem) => void;
  editingIndex: number | null;
  initialType?: TypeDefinition | null;
  initialValue?: Record<string, any>;
}

const TypedAttributesModal = ({
  isOpen,
  onClose,
  onSave,
  editingIndex,
  initialType,
  initialValue
}: TypedPropertyModalProps) => {
  const [selectedType, setSelectedType] = useState<TypeDefinition | null>(initialType || null);
  const [formValue, setFormValue] = useState<Record<string, any>>(initialValue || {});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
    }
    if (initialValue) {
      setFormValue(initialValue);
    }
  }, [initialType, initialValue]);

  const handleTypeSelect = (type: TypeDefinition, value: any) => {
    if (type) {
      setSelectedType(type);
    }
    if (value) {
      setFormValue(value);
    }
  };

  const handleSave = () => {
    if (!selectedType) return;

    const newProperty: TypedAttributesItem = {
      typeId: selectedType.pid,
      typeName: selectedType.name,
      value: formValue,
      validator: selectedType.validator,
      validatorInput: selectedType.validatorInput,
      validatorEndpoint: selectedType.validatorEndpoint,
      validatorArguments: selectedType.validatorArguments,
      _typeDef: selectedType
    };

    onSave(newProperty);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <dialog className="modal modal-open" open>
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {editingIndex !== null ? 'Edit' : 'Add'} Typed Attribute
        </h3>

        <SimpleTypeRegistryComponent
          key={editingIndex !== null ? `edit-${editingIndex}` : 'add-new'}
          onTypeSelect={handleTypeSelect}
          initialType={initialType}
          initialValue={initialValue}
        />

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          {selectedType && (
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>,
    document.body
  );
};

export default TypedAttributesModal;
