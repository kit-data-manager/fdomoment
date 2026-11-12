'use client';

import { useState, useMemo } from 'react';
import {
  EditorState,
  CoreMetadata,
  DataObjectMetadata,
  SoftwareMetadata,
  PublicationMetadata,
  MiscEntry,
  TemplateType
} from '@/lib/momentum/types';
import { RESEARCH_DOMAINS } from '@/lib/momentum/constants';
import {
  computeCoreMetadataStatus,
  computeDataObjectMetadataStatus,
  computeSoftwareMetadataStatus,
  computePublicationMetadataStatus,
  computeMiscMetadataStatus,
} from '@/lib/momentum/validation';
import {
  getModuleConfig,
  computeModuleStatus,
  isCoreModule,
} from '@/lib/momentum/registry';

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
      repositoryType: 'Other',
      repositoryUrl: '',
      repositoryUrlValidated: false,
      license: '',
      licenseImported: false,
      readmeUrl: '',
      readmeImported: false,
      hasMetadata: false,
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
    configModules: {},
    moduleStatus: {
      core: 'incomplete',
      dataobject: 'pristine',
      software: 'pristine',
      publication: 'pristine',
      additional: 'pristine',
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

  /**
   * Update a property value for a declaratively configured (generic) module.
   */
  const updateConfigModule = (
    moduleId: string,
    propertyId: string,
    partial: { value?: any; status?: any; message?: string }
  ) => {
    setState(prev => {
      const currentModule = prev.configModules[moduleId] ?? {};
      const currentProp = currentModule[propertyId] ?? { value: null, status: 'none' as const };
      const existingModules: Record<string, any> = { ...prev.configModules };
      existingModules[moduleId] = {
        ...currentModule,
        [propertyId]: { ...currentProp, ...partial },
      };
      return { ...prev, configModules: existingModules };
    });
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
    const configStatus: EditorState['moduleStatus'] = {
      core: computeCoreMetadataStatus(state.core),
      dataobject: computeDataObjectMetadataStatus(state.dataobject),
      software: computeSoftwareMetadataStatus(state.software),
      publication: computePublicationMetadataStatus(state.publication),
      additional: computeMiscMetadataStatus(state.misc),
    };

    // Reconcile registry-driven status for config-defined modules.
    const allEnabled = state.enabledModules;
    for (const moduleId of allEnabled) {
      const cfgModule = getModuleConfig(moduleId);
      if (!cfgModule) continue;
      if (cfgModule.kind === 'generic') {
        configStatus[moduleId] = computeModuleStatus(moduleId, {
          properties: state.configModules[moduleId] ?? {},
        });
      }
    }

    return configStatus;
  }, [state.core, state.dataobject, state.software, state.publication, state.misc, state.configModules, state.enabledModules]);

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

    // Any config-defined modules must also be 'complete' when enabled, but only if
    // they declare required properties (optional-only generic modules never block).
    for (const moduleId of enabled) {
      if (isCoreModule(moduleId)) continue;
      const cfgModule = getModuleConfig(moduleId);
      if (!cfgModule) continue;
      if (cfgModule.kind !== 'generic') continue;
      const hasRequired = (cfgModule.properties ?? []).some((p) => p.required);
      if (hasRequired && moduleStatus[moduleId] !== 'complete') {
        result = false;
      }
    }

    return result;
  }, [moduleStatus, state.enabledModules]);

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
    updateConfigModule,
    setTemplate,
    setActiveModule,
    canCreate,
    resetState,
  };
}
