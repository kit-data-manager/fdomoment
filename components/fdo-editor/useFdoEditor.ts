import { useState, useEffect, useCallback } from 'react';
import { ModuleDataType, ModuleType } from './types';

export const useFdoEditor = () => {
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [modulesData, setModulesData] = useState<Record<string, ModuleDataType>>({});
  const [openModuleId, setOpenModuleId] = useState<number>(1);
  const [helpMode, setHelpMode] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedModules = localStorage.getItem('fdoEditorModules');
    const openModule = localStorage.getItem('openModuleId');
    if (savedModules) {
      try {
        const parsed = JSON.parse(savedModules);
        setModules(parsed);
        if (openModule) {
          setOpenModuleId(Number.parseInt(openModule, 16));
        }
      } catch (error) {
        console.error('Error parsing saved modules:', error);
        setDefaultModules();
      }
    } else {
      setDefaultModules();
    }

    loadModuleData();
    setInitialized(true);
  }, []);

  const setDefaultModules = () => {
    const defaultModules = [{ id: 1, title: 'Core Attributes' }];
    setModules(defaultModules);
    setOpenModuleId(1);
  };

  const loadModuleData = () => {
    if (typeof window === 'undefined') return;

    const moduleMap: Record<string, string> = {
      'Core Attributes': 'coreAttributesInputs',
      'Digital Object Attributes': 'digitalObjectAttributesInputs',
      'Software Attributes': 'softwareAttributesInputs',
      'Additional Properties': 'additionalAttributesRows',
      'Typed Properties': 'typedProperties'
    };

    Object.entries(moduleMap).forEach(([title, key]) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          setModulesData(prev => ({ ...prev, [title]: JSON.parse(data) }));
        } catch (e) {
          console.error(`Error loading ${title}:`, e);
        }
      }
    });
  };

  const updateModuleData = useCallback((moduleTitle: string, data: ModuleDataType) => {
    setModulesData(prev => ({
      ...prev,
      [moduleTitle]: data
    }));

    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${moduleTitle.replace(' ', '').toLowerCase()}Data`;
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.error('Error saving module data:', e);
      }
    }
  }, []);

  const addModule = useCallback((title: string) => {
    const newId = Math.max(...modules.map(m => m.id), 0) + 1;
    const newModules = [...modules, { id: newId, title }];
    localStorage.setItem('fdoEditorModules', JSON.stringify(newModules));
    setModules(newModules);
  }, [modules]);

  const removeModule = useCallback((id: number) => {
    const newModules = modules.filter(module => module.id !== id);
    localStorage.setItem('fdoEditorModules', JSON.stringify(newModules));
    setModules(newModules);

    if (openModuleId === id) {
      const firstModuleId = newModules.length > 0 ? newModules[0].id : 1;
      setOpenModuleId(firstModuleId);
    }
  }, [modules, openModuleId]);

  const toggleHelpMode = useCallback((moduleTitle: string) => {
    setHelpMode(prev => ({
      ...prev,
      [moduleTitle]: !prev[moduleTitle]
    }));
  }, []);

  const setOpenModule = useCallback((id: number) => {
    setOpenModuleId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('openModuleId', id.toString());
    }
  }, []);

  return {
    modules,
    modulesData,
    openModuleId,
    helpMode,
    initialized,
    updateModuleData,
    addModule,
    removeModule,
    toggleHelpMode,
    setOpenModule,
    setModulesData
  };
};

export default useFdoEditor;
