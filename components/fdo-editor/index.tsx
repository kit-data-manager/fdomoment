"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Trash2 } from "lucide-react";
import { AppSidebar } from '@/components/AppSidebar';
import { useFdoEditor } from './useFdoEditor';
import ModuleRenderer from './ModuleRenderer';
import ValidationModal from './ValidationModal';
import { validateModulesData } from "@/utils/validator-utils";
import { ModuleDataType } from './types';

const allModuleTypes = ['Core Attributes', 'Digital Object Attributes', 'Software Attributes', 'Typed Properties', 'Additional Properties'];

const exclusiveGroups = [
  { types: ['Digital Object Attributes', 'Software Attributes'], icon: 'solar:link-round-angle-line-duotone' }
];

const FdoEditor = () => {
  const {
    modules,
    modulesData,
    openModuleId,
    helpMode,
    updateModuleData,
    addModule,
    removeModule,
    toggleHelpMode,
    setOpenModule,
    setModulesData
  } = useFdoEditor();

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const getModuleStatus = useCallback(() => {
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
  }, [modules]);

  const getExclusiveInfo = (type: string) => {
    for (const group of exclusiveGroups) {
      if (group.types.includes(type)) {
        return group;
      }
    }
    return null;
  };

  const getModuleData = async (module: { title: string }) => {
    const storageMap: Record<string, string> = {
      'Core Attributes': 'coreAttributesInputs',
      'Digital Object Attributes': 'digitalObjectAttributesInputs',
      'Software Attributes': 'softwareAttributesInputs',
      'Additional Properties': 'additionalAttributesRows',
      'Typed Properties': 'typedProperties'
    };

    const key = storageMap[module.title] || `${module.title.replace(' ', '').toLowerCase()}Data`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        let data = JSON.parse(stored);
        if (module.title === 'Typed Properties' && Array.isArray(data)) {
          data = { properties: data };
        }
        return data;
      } catch (e) {
        console.error('Error parsing stored data for', module.title, e);
      }
    }
    return null;
  };

  const handleCollectData = async () => {
    const visibleData: Record<string, any> = {};
    
    for (const module of modules) {
      let data = modulesData[module.title];
      
      if (!data) {
        data = await getModuleData(module);
      }
      
      if (data) {
        visibleData[module.title] = data;
      }
    }

    const result = validateModulesData(modules, visibleData);
    
    if (result.errors.length > 0) {
      setValidationErrors(result.errors);
      setShowValidationModal(true);
      return null;
    }
    
    return result.validData;
  };

  const moduleStatus = getModuleStatus();

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
                    setOpenModule(module.id);
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
                        removeModule(module.id);
                      }}
                      className="btn btn-link btn-primary btn-xs"
                      title="Remove module"
                    >
                      <Trash2 width="16" height="16" />
                    </button>
                  )}
                </div>
                <div className="collapse-content">
                  <ModuleRenderer
                    title={module.title}
                    id={module.id}
                    showHelp={!!helpMode[module.title]}
                    onDataChange={(data) => updateModuleData(module.title, data)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
      />
    </div>
  );
};

export { FdoEditor };
export default FdoEditor;
export type { ModuleDataType, ModuleType } from './types';
