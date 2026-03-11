'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";
import {Tag, Plus, Trash2, Trash} from "lucide-react";
import SimpleTypeRegistryComponent, {TypeDefinition} from '@/components/SimpleTypeRegistryComponent';

export interface TypedPropertyItem {
    typeId: string;
    typeName: string;
    value: Record<string, any>;
    validator?: "JSON" | "SPARQL";
    validatorInput?: string;
    validatorEndpoint?: string;
    validatorArguments?: Array<{ key: string; value: string }>;
    // Store complete type definition for editing
    _typeDef?: TypeDefinition;
}

export interface TypedPropertiesModuleData {
    properties: TypedPropertyItem[];
}

interface TypedPropertiesModuleProps {
    onDataChange: (data: TypedPropertiesModuleData) => void;
    showHelp?: boolean;
}

const TypedPropertiesSection = ({ onDataChange, showHelp = false }: TypedPropertiesModuleProps) => {
    const [moduleData, setModuleData] = useState<TypedPropertiesModuleData>(() => {
        if (typeof window === 'undefined') {
            return { properties: [] };
        }
        
        const stored = localStorage.getItem('typedProperties');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    properties: Array.isArray(parsed) ? parsed : (parsed.properties || [])
                };
            } catch (e) {
                console.error('Error parsing stored typed properties:', e);
            }
        }
        return { properties: [] };
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TypeDefinition | null>(null);
    const [formValue, setFormValue] = useState<Record<string, any>>({});
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Save to localStorage only when data actually changes via user action
    const updateModuleData = (newData: TypedPropertiesModuleData) => {
        setModuleData(newData);
        if (typeof window !== 'undefined') {
            localStorage.setItem('typedProperties', JSON.stringify(newData.properties));
        }
        onDataChange(newData);
    };

    const openEditModal = (index: number) => {
        const property = moduleData.properties[index];
        setEditingIndex(index);
        
        // Use stored type definition if available, otherwise reconstruct
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

    const handleTypeSelect = (type: TypeDefinition, value: any) => {
        if (type) {
            setSelectedType(type);
        }
        if (value) {
            setFormValue(value);
        }
    };

    const handleSaveProperty = () => {
        if (!selectedType) return;

        const newProperty: TypedPropertyItem = {
            typeId: selectedType.pid,
            typeName: selectedType.name,
            value: formValue,
            validator: selectedType.validator,
            validatorInput: selectedType.validatorInput,
            validatorEndpoint: selectedType.validatorEndpoint,
            validatorArguments: selectedType.validatorArguments,
            _typeDef: selectedType
        };

        let updatedProperties: TypedPropertyItem[];
        if (editingIndex !== null) {
            updatedProperties = [...moduleData.properties];
            updatedProperties[editingIndex] = newProperty;
        } else {
            updatedProperties = [...moduleData.properties, newProperty];
        }

        updateModuleData({ properties: updatedProperties });
        setIsModalOpen(false);
        setSelectedType(null);
        setFormValue({});
        setEditingIndex(null);
    };

    const removeProperty = (index: number) => {
        const updatedProperties = moduleData.properties.filter((_, i) => i !== index);
        updateModuleData({ properties: updatedProperties });
    };

    return (
        <div className="card bg-base-100 shadow-sm">
            {showHelp ? (
                <div className="card-body">
                    <figure className="relative w-full h-64">
                        <img
                            src="./typed_background.png"
                            alt="TypedPropertiesBackground"
                            className="opacity-10 logo w-full h-full object-contain"/>
                        <div
                            className="absolute inset-0 flex flex-col justify-center items-center text-secondary p-4">
                            <span className="text-base">
                                This module allows adding typed properties to the FAIR Digital Object. Each property has a specific type
                                with a defined schema that must be followed.
                                <br/><br/>
                                <span className="text-info">Typed Properties</span> enable structured data with validation.
                            </span>
                        </div>
                    </figure>
                </div>
            ) : (
                <div className="card-body min-w-0 flex-1">
                    {moduleData.properties.map((property, index) => (
                        <div key={index} className="row flex items-center gap-2 mb-2">
                            <fieldset className="fieldset w-full">
                                <label className="input w-full min-w-0">
                                    <Tag className="flex-shrink-0"/>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <span className="font-medium text-ellipsis">{property.typeName}</span>
                                        <span className="text-sm text-base-content/60 ml-2 text-ellipsis">({property.typeId})</span>
                                    </div>
                                </label>
                            </fieldset>
                            <button
                                onClick={() => openEditModal(index)}
                                className="btn btn-ghost btn-xs"
                                title="Edit property"
                            >
                                <Icon icon="mdi:pencil" width="16" height="16" />
                            </button>
                            <button
                                onClick={() => removeProperty(index)}
                                className="btn btn-ghost btn-xs"
                                title="Remove property"
                            >
                                <Trash2 width="16" height="16" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={openAddModal}
                        className="btn btn-soft btn-info btn-sm w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Typed Property
                    </button>
                </div>
            )}

            {/* Modal for adding/editing typed property */}
            <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box max-w-2xl">
                    <h3 className="font-bold text-lg mb-4">
                        {editingIndex !== null ? 'Edit' : 'Add'} Typed Property
                    </h3>

                    <SimpleTypeRegistryComponent
                        key={editingIndex !== null ? `edit-${editingIndex}` : 'add-new'}
                        onTypeSelect={handleTypeSelect}
                        initialType={selectedType}
                        initialValue={formValue}
                    />

                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        {selectedType && (
                            <button className="btn btn-primary" onClick={handleSaveProperty}>Save</button>
                        )}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsModalOpen(false)}>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default TypedPropertiesSection;
