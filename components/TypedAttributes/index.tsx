'use client';

import React, { useState } from 'react';
import { Plus } from "lucide-react";
import { useTypedAttributes } from '@/components/TypedAttributes/useTypedAttributes';
import TypedPropertyItemComponent from '@/components/TypedAttributes/TypedAttributesItem';
import TypedAttributesModal from '@/components/TypedAttributes/TypedAttributesModal';
import {TypeAttributesModuleProps, TypedAttributesItem} from '@/components/TypedAttributes/types';
import {TypeDefinition} from "@/components/SimpleTypeRegistryComponent/types";

const TypedAttributes = ({ onDataChange, showHelp = false }: TypeAttributesModuleProps) => {
  const { properties, addAttribute, updateAttribute, removeAttribute } = useTypedAttributes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<TypeDefinition | null>(null);
  const [formValue, setFormValue] = useState<Record<string, any>>({});

  const openEditModal = (index: number) => {
    const property = properties[index];
    setEditingIndex(index);
    
    const typeDef: TypeDefinition = property._typeDef || {
      pid: property.typeId,
      name: property.typeName,
      description: property.typeName,
      validator: (property.validator || "JSON") as "JSON" | "SPARQL",
      validatorInput: property.validatorInput || "",
      validatorEndpoint: property.validatorEndpoint || "",
      validatorArguments: property.validatorArguments || []
    };
    
    setSelectedType(typeDef);
    setFormValue(property.value);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingIndex(null);
    setSelectedType(null);
    setFormValue({});
    setIsModalOpen(true);
  };

  const handleSaveProperty = (property: TypedAttributesItem) => {
    if (editingIndex !== null) {
      updateAttribute(editingIndex, property);
    } else {
      addAttribute(property);
    }
    setIsModalOpen(false);
    setSelectedType(null);
    setFormValue({});
    setEditingIndex(null);
    
    const newData = editingIndex !== null 
      ? { properties: properties.map((p, i) => i === editingIndex ? property : p) }
      : { properties: [...properties, property] };
    
    onDataChange(newData);
  };

  const handleRemoveProperty = (index: number) => {
    removeAttribute(index);
    const newData = { properties: properties.filter((_, i) => i !== index) };
    onDataChange(newData);
  };

  if (showHelp) {
    return (
      <div className="card bg-base-100 shadow-sm relative">
        <div className="card-body">
          <figure className="relative w-full h-64">
            <img
              src="./typed_background.png"
              alt="TypedPropertiesBackground"
              className="opacity-10 logo w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-secondary p-4">
              <span className="text-base">
                This module allows adding typed attributes to the FAIR Digital Object. Each property has a specific type
                with a defined schema that must be followed.
                <br /><br />
                <span className="text-info">Typed Attributes</span> enable structured data with validation.
              </span>
            </div>
          </figure>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card bg-base-100 shadow-sm relative">
        <div className="card-body min-w-0 flex-1">
          {properties.map((property, index) => (
            <TypedPropertyItemComponent
              key={index}
              property={property}
              index={index}
              onEdit={openEditModal}
              onRemove={handleRemoveProperty}
            />
          ))}
          <button
            onClick={openAddModal}
            className="btn btn-soft btn-info btn-sm w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Typed Attribute
          </button>
        </div>
      </div>

      <TypedAttributesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProperty}
        editingIndex={editingIndex}
        initialType={selectedType}
        initialValue={formValue}
      />
    </>
  );
};

export { TypedAttributes };
export default TypedAttributes;
export type { TypedAttributesItem, TypedAttributesModuleData } from './types';
