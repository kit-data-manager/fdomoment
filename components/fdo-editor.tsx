"use client";
import React, {useState, useEffect} from 'react';
import CoreAttributes, {CoreAttributesModuleData} from './CoreAttributes';
import DigitalObjectAttributes, {DigitalObjectModuleData} from './DigitalObjectAttributes';
import AdditionalAttributes from './AdditionalAttributes';
import SoftwareAttributes, {SoftwareModuleData} from './SoftwareAttributes';
import TypedPropertiesSection, {TypedPropertiesModuleData} from "@/components/TypedPropertiesSection";
import {Icon} from '@iconify/react';
import {AppSidebar} from './app-sidebar';
import {Trash2, HelpCircle} from "lucide-react";
import {validateModulesData, ValidationResponse} from "@/utils/validator-utils";

export type ModuleDataType =
    | CoreAttributesModuleData
    | DigitalObjectModuleData
    | SoftwareModuleData
    | TypedPropertiesModuleData; // Additional Properties uses array

export type ModuleType = {
    id: number;
    title: string;
}

export function EditorWithSidebar() {
    // Load saved modules from localStorage on component mount
    const [modules, setModules] = useState((): ModuleType[] => {
        if (typeof window === 'undefined') {
            return [{id: 1, title: 'Core Attributes'}];
        }
        const savedModules: string = localStorage.getItem('fdoEditorModules') as string;
        if (savedModules) {
            try {
                return JSON.parse(savedModules);
            } catch (error) {
                console.error('Error parsing saved modules:', error);
            }
        }
        // Default to Core Attributes if no saved modules
        return [
            {id: 1, title: 'Core Attributes'}
        ];
    });

    const [modulesData, setModulesData] = useState<Record<string, ModuleDataType>>({});
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [helpMode, setHelpMode] = useState<Record<string, boolean>>({});

    // Load module data from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load Core Attributes
        const coreData = localStorage.getItem('coreAttributesInputs');
        if (coreData) {
            try {
                setModulesData(prev => ({...prev, 'Core Attributes': JSON.parse(coreData)}));
            } catch (e) {
                console.error('Error loading core attributes:', e);
            }
        }

        // Load Digital Object Attributes
        const digitalObjectData = localStorage.getItem('digitalObjectAttributesInputs');
        if (digitalObjectData) {
            try {
                setModulesData(prev => ({...prev, 'Digital Object Attributes': JSON.parse(digitalObjectData)}));
            } catch (e) {
                console.error('Error loading digital object attributes:', e);
            }
        }

        // Load Software Attributes
        const softwareData = localStorage.getItem('softwareAttributesInputs');
        if (softwareData) {
            try {
                setModulesData(prev => ({...prev, 'Software Attributes': JSON.parse(softwareData)}));
            } catch (e) {
                console.error('Error loading software attributes:', e);
            }
        }

        // Load Additional Attributes
        const additionalRows = localStorage.getItem('additionalAttributesRows');
        if (additionalRows) {
            try {
                setModulesData(prev => ({...prev, 'Additional Properties': JSON.parse(additionalRows)}));
            } catch (e) {
                console.error('Error loading additional attributes:', e);
            }
        }
    }, []);

    // Load saved open module ID from localStorage on component mount
    const [openModuleId, setOpenModuleId] = useState<number>(() => {
        if (typeof window === 'undefined') {
            return 1;
        }
        const savedOpenModuleId = localStorage.getItem('openModuleId');
        return savedOpenModuleId ? parseInt(savedOpenModuleId) : 1;
    });

    const allModuleTypes = ['Core Attributes', 'Digital Object Attributes', 'Software Attributes', 'Typed Properties', 'Additional Properties'];

    const exclusiveGroups = [
        {types: ['Digital Object Attributes', 'Software Attributes'], icon: 'solar:link-round-angle-line-duotone'}
    ];

    const getModuleStatus = (modules: { id: number; title: string }[]) => {
        const addedTypes = new Set(modules.map(s => s.title));

        const disabledReasons: Record<string, string> = {};

        for (const type of allModuleTypes) {
            if (addedTypes.has(type)) {
                disabledReasons[type] = 'added';
            }
        }

        for (const group of exclusiveGroups) {
            const presentInModules = group.types.filter(type => addedTypes.has(type));
            if (presentInModules.length > 0) {
                for (const type of group.types) {
                    if (!addedTypes.has(type)) {
                        disabledReasons[type] = `exclusive:${presentInModules[0]}`;
                    }
                }
            }
        }

        return disabledReasons;
    };

    const getExclusiveInfo = (type: string) => {
        for (const group of exclusiveGroups) {
            if (group.types.includes(type)) {
                return group;
            }
        }
        return null;
    };

    const moduleStatus = getModuleStatus(modules);

    const handleRemoveModule = (id: number) => {
        const modified_modules = modules.filter(module => module.id !== id);
        localStorage.setItem('fdoEditorModules', JSON.stringify(modified_modules));
        setModules(modified_modules);

        // If removed module was the open one, open the first module
        if (openModuleId === id) {
            const firstModuleId = modules.length > 1 ? modules[0].id : 1;
            setOpenModuleId(firstModuleId);
        }
    };

    // Save open module ID to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('openModuleId', openModuleId.toString());
    }, [openModuleId]);

    const updateModuleData = (moduleTitle: string, data: ModuleDataType) => {
        setModulesData(prev => ({
            ...prev,
            [moduleTitle]: data
        }));

        // Also save to localStorage for persistence
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(`${moduleTitle.replace(' ', '').toLowerCase()}Data`, JSON.stringify(data));
            } catch (e) {
                console.error('Error saving module data:', e);
            }
        }
    };

    const toggleHelpMode = (moduleTitle: string) => {
        setHelpMode(prev => ({
            ...prev,
            [moduleTitle]: !prev[moduleTitle]
        }));
    };

    const addModule = (title: string) => {
        const newId = Math.max(...modules.map((s: { id: number, title: string }) => s.id), 0) + 1;
        const modified_modules = [...modules, {id: newId, title}];
        localStorage.setItem('fdoEditorModules', JSON.stringify(modified_modules));
        setModules(modified_modules);
    };

    const renderModuleContent = (title: string, id: number) => {
        switch (title) {
            case 'Core Attributes':
                return <CoreAttributes onDataChange={(data) => updateModuleData('Core Attributes', data)} showHelp={!!helpMode[title]}/>;
            case 'Digital Object Attributes':
                return <DigitalObjectAttributes
                    onDataChange={(data) => updateModuleData('Digital Object Attributes', data)}
                    showHelp={!!helpMode[title]}/>;
            case 'Typed Properties':
                return <TypedPropertiesSection onDataChange={(data) => updateModuleData('Typed Properties', data)} showHelp={!!helpMode[title]}/>;
            case 'Additional Properties':
                return <AdditionalAttributes onDataChange={(data) => updateModuleData('Additional Properties', data)} showHelp={!!helpMode[title]}/>;
            case 'Software Attributes':
                return <SoftwareAttributes onDataChange={(data) => updateModuleData('Software Attributes', data)} showHelp={!!helpMode[title]}/>;
            default:
                return null;
        }
    };

    const handleCollectData = () => {
        const visibleData: Record<string, any> = {};
        const errors: string[] = [];
        
        // Collect data from all modules
        modules.forEach((module: { id: number, title: string }) => {
            let data = modulesData[module.title];
            
            // If not in state, try localStorage
            if (!data && typeof window !== 'undefined') {
                const storageKey = module.title.replace(' ', '').toLowerCase();
                const stored = localStorage.getItem(`${storageKey}Data`);
                if (stored) {
                    try {
                        data = JSON.parse(stored);
                    } catch (e) {
                        console.error('Error parsing stored data for', module.title, e);
                    }
                }
            }
            
            // Special handling for Core Attributes
            if (module.title === 'Core Attributes' && !data && typeof window !== 'undefined') {
                const coreStored = localStorage.getItem('coreAttributesInputs');
                if (coreStored) {
                    try {
                        data = JSON.parse(coreStored);
                    } catch (e) {
                        console.error('Error parsing core attributes', e);
                    }
                }
            }
            
            // Special handling for Digital Object Attributes
            if (module.title === 'Digital Object Attributes' && !data && typeof window !== 'undefined') {
                const digitalObjectStored = localStorage.getItem('digitalObjectAttributesInputs');
                if (digitalObjectStored) {
                    try {
                        data = JSON.parse(digitalObjectStored);
                    } catch (e) {
                        console.error('Error parsing digital object attributes', e);
                    }
                }
            }
            
            // Special handling for Software Attributes
            if (module.title === 'Software Attributes' && !data && typeof window !== 'undefined') {
                const softwareStored = localStorage.getItem('softwareAttributesInputs');
                if (softwareStored) {
                    try {
                        data = JSON.parse(softwareStored);
                    } catch (e) {
                        console.error('Error parsing software attributes', e);
                    }
                }
            }
            
            // Special handling for Additional Properties
            if (module.title === 'Additional Properties' && !data && typeof window !== 'undefined') {
                const additionalStored = localStorage.getItem('additionalAttributesRows');
                if (additionalStored) {
                    try {
                        data = JSON.parse(additionalStored);
                    } catch (e) {
                        console.error('Error parsing additional attributes', e);
                    }
                }
            }
            
            // Special handling for Typed Properties
            if (module.title === 'Typed Properties' && !data && typeof window !== 'undefined') {
                const typedStored = localStorage.getItem('typedProperties');
                if (typedStored) {
                    try {
                        data = JSON.parse(typedStored);
                    } catch (e) {
                        console.error('Error parsing typed properties', e);
                    }
                }
            }
            
            if (data) {
                visibleData[module.title] = data;
            }
        });

        const result:ValidationResponse = validateModulesData(modules, visibleData);
        
        if (result.errors.length > 0) {
            setValidationErrors(result.errors);
            setShowValidationModal(true);
            return null;
        }
        
        return result.validData;
    };

    return (
        <div className="flex h-screen w-full">
            <AppSidebar
                allModuleTypes={allModuleTypes}
                moduleStatus={moduleStatus}
                getExclusiveInfo={getExclusiveInfo}
                onAddModule={addModule}
                onCollectData={handleCollectData}
            />
            <main className="flex-1 p-6 overflow-auto">
                <div className="p-4 rounded-lg shadow-md">
                    <div className="join join-vertical w-full">
                        {modules.map((module) => (
                            <div key={module.id} className="collapse join-item border mb-2 relative">
                                <input
                                    type="radio"
                                    name="accordion"
                                    defaultChecked={module.title === 'Core Attributes'}
                                    onChange={() => {
                                        setOpenModuleId(module.id);
                                    }}
                                />
                                <div className="collapse-title flex justify-between items-center pr-2">
                                    <label className="text-lg font-semibold cursor-pointer">{module.title}</label>
                                </div>
                                <div className="absolute right-4 top-4 z-20 flex gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleHelpMode(module.title);
                                        }}
                                        className={`btn btn-link btn-xs ${helpMode[module.title] ? 'btn-active' : ''}`}
                                        title={helpMode[module.title] ? "Hide help" : "Show help"}
                                    >
                                        <HelpCircle className={`w-4 h-4 ${helpMode[module.title] ? 'text-info' : ''}`} />
                                    </button>
                                    {module.title !== 'Core Attributes' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveModule(module.id);
                                            }}
                                            className="btn btn-link btn-primary btn-xs"
                                            title="Remove module"
                                        >
                                            <Trash2 width="16" height="16" />
                                        </button>
                                    )}
                                </div>
                                <div className="collapse-content">
                                    {renderModuleContent(module.title, module.id)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Validation Error Modal */}
            {showValidationModal && (
                <dialog className="modal modal-open" open>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-error mb-4">Validation Errors</h3>
                        <p className="py-2">The following fields need to be filled:</p>
                        <ul className="list-disc list-inside mb-4">
                            {validationErrors.map((error, index) => (
                                <li key={index} className="text-sm">{error}</li>
                            ))}
                        </ul>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={() => setShowValidationModal(false)}>Close
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowValidationModal(false)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
}

export default EditorWithSidebar;
