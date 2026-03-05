"use client";
import React, { useState, useRef, useEffect } from 'react';
import CoreAttributes from './CoreAttributes';
import DigitalObjectAttributes, {DigitalObjectModuleData} from './DigitalObjectAttributes';
import AdditionalAttributes from './AdditionalAttributes';
import SoftwareAttributes from './SoftwareAttributes';
import { Icon } from '@iconify/react';
import TypedPropertiesSection from "@/components/TypedPropertiesSection";
import { AppSidebar } from './app-sidebar';

type ModuleRef = {
  save: () => void;
};

type ModuleDataType =
    | DigitalObjectModuleData;

type ModuleType = {
    id:number;
    title:string;
}

export function EditorWithSidebar() {
  // Load saved modules from localStorage on component mount
  const [modules, setModules] = useState((): ModuleType[] => {
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
      { id: 1, title: 'Core Attributes' }
    ];
  });
  
  const [modulesData, setModulesData] = useState<Record<string, ModuleDataType>>({});
  
  // Load saved open module ID from localStorage on component mount
  const [openModuleId, setOpenModuleId] = useState<number>(() => {
    const savedOpenModuleId = localStorage.getItem('openModuleId');
    return savedOpenModuleId ? parseInt(savedOpenModuleId) : 1;
  });
  
const moduleRefs = useRef<Record<number, React.RefObject<ModuleRef>>>({});

const modulesWithSave = new Set(['Core Attributes', 'Digital Object Attributes', 'Additional Properties']);

const allModuleTypes = ['Core Attributes', 'Digital Object Attributes', 'Software Attributes', 'Typed Properties', 'Additional Properties'];

const exclusiveGroups = [
  { types: ['Digital Object Attributes', 'Software Attributes'], icon: 'solar:link-round-angle-line-duotone' }
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

  const handleSaveModule = (id: number) => {
    const ref = moduleRefs.current[id];
    if (ref?.current) {
      ref.current.save();
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
   };

  const collectData = () => {
    const visibleData: Record<string, ModuleDataType> = {};
    modules.forEach((module: { id: number, title: string }) => {
      if (modulesData[module.title]) {
        visibleData[module.title] = modulesData[module.title];
      }
    });
    return visibleData;
  };

  const addModule = (title: string) => {
    const newId = Math.max(...modules.map((s: { id: number, title: string }) => s.id), 0) + 1;
    const modified_modules =[...modules, { id: newId, title }];
    localStorage.setItem('fdoEditorModules', JSON.stringify(modified_modules));
    setModules(modified_modules);
  };

  const renderModuleContent = (title: string, id: number) => {
    const hasSave = modulesWithSave.has(title);
    const ref = hasSave ? (moduleRefs.current[id] = moduleRefs.current[id] || React.createRef<ModuleRef>()) : null;
    
    switch (title) {
      case 'Core Attributes':
        return <CoreAttributes ref={ref!} onDataChange={(data) => updateModuleData('Core Attributes', data)} />;
      case 'Digital Object Attributes':
        return <DigitalObjectAttributes ref={ref!} onDataChange={(data) => updateModuleData('Digital Object Attributes', data)} />;
      case 'Typed Properties':
        return <TypedPropertiesSection onTypeSelected={(data) => updateModuleData('Typed Properties', data)} />;
      case 'Additional Properties':
        return <AdditionalAttributes ref={ref!} onDataChange={(data) => updateModuleData('Additional Properties', data)} />;
      case 'Software Attributes':
        return <SoftwareAttributes onDataChange={(data) => updateModuleData('Software Attributes', data)} />;
      default:
        return null;
    }
  };

  const hasSaveSupport = (title: string) => modulesWithSave.has(title);

  return (
    <div className="flex h-screen w-full">
      <AppSidebar 
        allModuleTypes={allModuleTypes}
        moduleStatus={moduleStatus}
        getExclusiveInfo={getExclusiveInfo}
        onAddModule={addModule}
        onCollectData={() => console.debug(JSON.stringify(collectData(), null, 4))}
      />
      <main className="flex-1 p-6">
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
                    {hasSaveSupport(module.title) && (
                    <button
                      onClick={() => handleSaveModule(module.id)}
                      className="btn btn-link btn-primary btn-xs"
                      title="Save module"
                    >
                      <Icon icon="mdi:content-save" width="20" height="20" />
                    </button>
                  )}
                  {module.title !== 'Core Attributes' && (
                    <button
                      onClick={() => handleRemoveModule(module.id)}
                      className="btn btn-link btn-primary btn-xs"
                      title="Remove module"
                    >
                      <Icon icon="mdi:close" width="20" height="20" />
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
    </div>
  );
}

export default EditorWithSidebar;
