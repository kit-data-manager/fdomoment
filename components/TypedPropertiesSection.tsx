'use client';

import React, { useState, useEffect } from 'react';
import { useTypeAPI } from '@/utils/typeapi-client';
import { Form } from '@rjsf/daisyui';
import ajv from '@rjsf/validator-ajv8';
import { Icon } from "@iconify/react";
import { Tag, Plus, Trash2 } from "lucide-react";


interface TypedProperty {
    typeId: string;
    typeName: string;
    value: Record<string, any>;
}

interface TypedPropertiesSectionProps {
  onTypeSelected: (data: Record<string, any>) => void;
}

const TypedPropertiesSection = ({ onTypeSelected }: TypedPropertiesSectionProps) => {
    const { searchTypes, getTypeById, resolveNestedTypes } = useTypeAPI();
    const [typedProperties, setTypedProperties] = useState<TypedProperty[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }
        const stored = localStorage.getItem('typedProperties');
        return stored ? JSON.parse(stored) : [];
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [formValue, setFormValue] = useState<Record<string, any>>({});
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem('typedProperties', JSON.stringify(typedProperties));
        onTypeSelected(typedProperties);
    }, [typedProperties]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length >= 3) {
                try {
                    const results = await searchTypes(searchQuery);
                    setSearchResults(results);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Error searching types:', error);
                    setSearchResults([]);
                    setShowSuggestions(false);
                }
            } else {
                setSearchResults([]);
                setShowSuggestions(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery, searchTypes]);

    const handleTypeSelect = async (typeId: string) => {
        try {
            const type = await getTypeById(typeId);
            setSelectedType(type);
            setSearchQuery('');
            setShowSuggestions(false);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error selecting type:', error);
        }
    };
    const openEditModal = (index: number) => {
        const property = typedProperties[index];
        setEditingIndex(index);
        getTypeById(property.typeId).then(async (type) => {
            setSelectedType(type);
            setFormValue(property.value);
            setIsModalOpen(true);
        });
    };

    const openAddModal = () => {
        setEditingIndex(null);
        setSelectedType(null);
        setFormValue({});
        setSearchQuery('');
        setShowSuggestions(false);
        setIsModalOpen(true);

    };

    const handleSaveProperty = () => {
        if (!selectedType) return;

        const newProperty: TypedProperty = {
            typeId: selectedType.id,
            typeName: selectedType.name,
            value: formValue
        };

        if (editingIndex !== null) {
            const updated = [...typedProperties];
            updated[editingIndex] = newProperty;
            setTypedProperties(updated);
        } else {
            setTypedProperties([...typedProperties, newProperty]);
        }

        setIsModalOpen(false);
        setSelectedType(null);
        setFormValue({});
        setEditingIndex(null);
    };

    const removeProperty = (index: number) => {
        const updated = typedProperties.filter((_, i) => i !== index);
        setTypedProperties(updated);
    };

    const handleFormChange = (formData: any) => {
        setFormValue(formData);
    };

    return (
        <div className="card card-side bg-base-100 shadow-sm">
            <figure className="relative w-72 h-full">
                <img
                    src="./typed_background.png"
                    alt="TypedPropertiesBackground"
                    className="opacity-10 logo border-r-2 border-secondary"/>
                <div
                    className="absolute -top-12 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-secondary p-4">
                    <span className="text-sm">
                        This module allows adding typed properties to the FAIR Digital Object. Each property has a specific type
                        with a defined schema that must be followed.
                        <br/><br/>
                        <span className="text-info">Typed Properties</span> enable structured data with validation.
                    </span>
                </div>
            </figure>
            <div className="card-body">
                {typedProperties.map((property, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded mb-2">
                        <Tag className="flex-shrink-0" />
                        <div className="flex-1">
                            <span className="font-medium">{property.typeName}</span>
                            <span className="text-sm text-base-content/60 ml-2">({property.typeId})</span>
                        </div>
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

            {/* Modal for adding/editing typed property */}
            <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box max-w-2xl">
                    <h3 className="font-bold text-lg mb-4">
                        {editingIndex !== null ? 'Edit' : 'Add'} Typed Property
                    </h3>

                    {!selectedType ? (
                        <div className="relative">
                            <fieldset className="fieldset w-full">
                                <label className="input w-full">
                                    <Tag />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full"
                                        placeholder="Search for types (min 3 characters)..."
                                        onFocus={() => searchQuery.length >= 3 && setShowSuggestions(true)}
                                    />
                                </label>
                            </fieldset>

                            {showSuggestions && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full bg-base-100 border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                    {searchResults.map(type => (
                                        <button
                                            key={type.id}
                                            className="w-full text-left px-4 py-2 hover:bg-base-200"
                                            onClick={() => {
                                                handleTypeSelect(type.id);
                                            }}
                                        >
                                            <div className="font-medium">{type.name}</div>
                                            <div className="text-sm text-base-content/60">{type.id}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold">{selectedType.name}</h4>
                                    <p className="text-sm text-base-content/60">{selectedType.id}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedType(null);
                                        setSearchQuery('');
                                    }}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <Icon icon="mdi:close" width="20" height="20" />
                                </button>
                            </div>

                            <Form
                                schema={selectedType.schema || {}}
                                formData={formValue}
                                onChange={(data: any) => handleFormChange(data.formData)}
                                validator={ajv}
                                className="w-full"
                            >
                                <div className="mt-4" />
                            </Form>
                        </div>
                    )}

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
