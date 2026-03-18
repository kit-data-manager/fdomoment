import { useState, useEffect, useCallback } from 'react';
import {MODULE_MAP, ModuleDataType, ModuleType} from './types';
import {finalizeModulesData} from "@/utils/validator-utils";
import {RecordData} from "@/utils/recordBuilder";

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

    Object.entries(MODULE_MAP).forEach(([title, key]) => {
      let data = localStorage.getItem(key);
      
      if (!data) {
        const oldKey = `${title.replace(' ', '').toLowerCase()}Data`;
        data = localStorage.getItem(oldKey);
        if (data) {
          localStorage.setItem(key, data);
          localStorage.removeItem(oldKey);
        }
      }
      
      if (data) {
        try {
          setModulesData(prev => ({ ...prev, [title]: JSON.parse(data) }));
        } catch (e) {
          console.error(`Error loading ${title}:`, e);
        }
      }
    });
  };

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

  const doExport = (data: RecordData) => {
      console.log("Doing export of ", data);

  }

  return {
    modules,
    modulesData,
    openModuleId,
    helpMode,
    initialized,
      doExport,
      addModule,
    removeModule,
    toggleHelpMode,
    setOpenModule,
    setModulesData
  };
};

export default useFdoEditor;
