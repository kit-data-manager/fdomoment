'use client';

import { useState, useMemo } from 'react';
import {
  EditorState,
  CoreMetadata,
  DataObjectMetadata,
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
    
    // Must have at least one content module (dataobject, software, or publication)
    const hasDataObject = enabled.includes('dataobject') && moduleStatus.dataobject === 'complete';
    const hasSoftware = enabled.includes('software') && moduleStatus.software === 'complete';
    const hasPublication = enabled.includes('publication') && moduleStatus.publication === 'complete';
    
    // At least one content module must be enabled and complete
    const hasContentModule = hasDataObject || hasSoftware || hasPublication;
    
    // If misc is enabled, it's optional (doesn't block creation)
    
    return hasContentModule;
  }, [moduleStatus, state.enabledModules]);

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
  };
}
