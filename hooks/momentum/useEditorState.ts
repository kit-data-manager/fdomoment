'use client';

import { useState, useMemo } from 'react';
import {
  EditorState,
  CoreMetadata,
  DataObjectMetadata,
  ModuleIdentifier,
  MODULE_ORDER,
  SoftwareMetadata,
  PublicationMetadata,
  MiscEntry,
  TemplateType,
  ResearchDomain,
} from '@/lib/momentum/types';
import { RESEARCH_DOMAINS } from '@/lib/momentum/constants';
import {
  computeCoreMetadataStatus,
  computeDataObjectMetadataStatus,
  computeSoftwareMetadataStatus,
  computePublicationMetadataStatus,
  computeMiscMetadataStatus,
} from '@/lib/momentum/validation';

function createInitialState(): EditorState {
  // Load user settings from localStorage
  let defaultOrcid = '';
  let defaultOrcidName = null;
  let defaultOrcidEmail = null;
  let defaultOrcidValidated = false;
  let defaultResearchDomain = null;
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('fdmoment-user-settings');
        if (stored) {
      try {
        const settings = JSON.parse(stored);
        defaultOrcid = settings.orcid || '';
        defaultOrcidName = settings.orcidName || null;
        defaultOrcidEmail = settings.orcidEmail || null;
        defaultOrcidValidated = settings.orcidValidated || false;
        if (settings.researchDomain) {
          const domain = RESEARCH_DOMAINS.find(d => d.id === settings.researchDomain);
          defaultResearchDomain = domain || null;
        }
      } catch (e) {
        console.error('Failed to load user settings:', e);
      }
    }
  }
  
  return {
    template: null,
    enabledModules: [],
    activeModule: 'template-select',
    core: {
      researchDomain: defaultResearchDomain,
      orcid: defaultOrcid,
      orcidName: defaultOrcidName,
      orcidEmail: defaultOrcidEmail,
      orcidValidated: defaultOrcidValidated,
    },
    dataobject: {
      license: '',
      licenseUrl: '',
      mimeType: '',
      dataUrl: '',
      dataUrlValidated: false,
      dataUrlRepository: null,
    },
    software: {
      repositoryType: 'GitHub',
      repositoryUrl: '',
      repositoryUrlValidated: false,
      license: '',
      licenseImported: false,
      readmeUrl: '',
      readmeImported: false,
    },
    publication: {
        doi: '',
        title:'',
        titleImported:false,
        publicationType:'',
        publicationTypeImported:false,
        creators:[],
        creatorsImported:false
    },
    misc: {
        entries: []
    },
    moduleStatus: {
      core: 'incomplete',
      dataobject: 'pristine',
      software: 'pristine',
      publication: 'pristine',
      misc: 'pristine',
    },
  };
}

export function useEditorState() {
  const [state, setState] = useState<EditorState>(createInitialState());

  const updateBasis = (partial: Partial<CoreMetadata>) => {
    setState(prev => ({
      ...prev,
      core: { ...prev.core, ...partial },
    }));
  };

  const updateDataset = (partial: Partial<DataObjectMetadata>) => {
    setState(prev => ({
      ...prev,
      dataobject: { ...prev.dataobject, ...partial },
    }));
  };

  const updateSoftware = (partial: Partial<SoftwareMetadata>) => {
    setState(prev => ({
      ...prev,
      software: { ...prev.software, ...partial },
    }));
  };

  const updatePublication = (partial: Partial<PublicationMetadata>) => {
      setState(prev => ({
          ...prev,
          publication: { ...prev.publication, ...partial },
      }));
  };

  const updateMisc = (entries: MiscEntry[]) => {
    setState(prev => ({
      ...prev,
      misc: { entries },
    }));
  };

  const setTemplate = (template: TemplateType, enabledModules?: string[]) => {
    setState(prev => {
      return {
        ...prev,
        template,
        enabledModules: enabledModules || prev.enabledModules,
      };
    });
  };

  const setActiveModule = (module: EditorState['activeModule']) => {
    setState(prev => ({
      ...prev,
      activeModule: module,
    }));
  };

  const moduleStatus = useMemo<EditorState['moduleStatus']>(() => {
    return {
      core: computeCoreMetadataStatus(state.core),
      dataobject: computeDataObjectMetadataStatus(state.dataobject),
      software: computeSoftwareMetadataStatus(state.software),
      publication: computePublicationMetadataStatus(state.publication),
      misc: computeMiscMetadataStatus(state.misc),
    };
  }, [state.core, state.dataobject, state.software, state.publication, state.misc]);

  const canCreate = useMemo(() => {
    // Must always have core module complete
    if (moduleStatus.core !== 'complete') {
      return false;
    }

    // Get enabled modules from state
    const enabled = state.enabledModules;

    let result = true;
    if(enabled.includes('dataobject')){
      result = moduleStatus.dataobject === 'complete';
    }

    if(enabled.includes('software')){
      result = result && moduleStatus.software === 'complete';
    }

    if(enabled.includes('publication')){
      result = result && moduleStatus.publication === 'complete';
    }

    return result;
  }, [moduleStatus, state.enabledModules]);

  const getNextModule = (currentModule: ModuleIdentifier): ModuleIdentifier | null => {
    const currentIndex = MODULE_ORDER.indexOf(currentModule);
    for (let i = currentIndex + 1; i < MODULE_ORDER.length; i++) {
      if (state.enabledModules.includes(MODULE_ORDER[i])) {
        return MODULE_ORDER[i];
      }
    }
    return null;
  };

  const getPrevModule = (currentModule: ModuleIdentifier): ModuleIdentifier | null => {
    const currentIndex = MODULE_ORDER.indexOf(currentModule);
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (state.enabledModules.includes(MODULE_ORDER[i]) || MODULE_ORDER[i] === 'core') {
        return MODULE_ORDER[i];
      }
    }
    return null;
  };

  const isModuleEnabled = (moduleId: ModuleIdentifier): boolean => {
    return state.enabledModules.includes(moduleId);
  };

  const hasSubsequentModule = (currentModule: ModuleIdentifier): boolean => {
    const currentIndex = MODULE_ORDER.indexOf(currentModule);
    for (let i = currentIndex + 1; i < MODULE_ORDER.length; i++) {
      if (state.enabledModules.includes(MODULE_ORDER[i])) {
        return true;
      }
    }
    return false;
  };

  const resetState = () => {
    setState(createInitialState());
  };

  return {
    state: { ...state, moduleStatus },
    updateBasis,
    updateDataset,
    updateSoftware,
    updatePublication,
    updateMisc,
    setTemplate,
    setActiveModule,
    canCreate,
    resetState,
  };
}
