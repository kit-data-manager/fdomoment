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
} from '@/lib/momentum/types';
import {
  computeCoreMetadataStatus,
  computeDataObjectMetadataStatus,
  computeSoftwareMetadataStatus,
  computePublicationMetadataStatus,
  computeMiscMetadataStatus,
} from '@/lib/momentum/validation';

function createInitialState(): EditorState {
  return {
    template: null,
    activeModule: 'template-select',
    core: {
      researchDomain: null,
      orcid: '',
      orcidName: null,
      orcidEmail: null,
      orcidValidated: false,
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

  const setTemplate = (template: TemplateType) => {
    setState(prev => {
      return {
        ...prev,
        template
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
    const hasPublication = state.template?.startsWith('published-');
    
    if (hasPublication) {
      return (
        moduleStatus.core === 'complete' &&
        (moduleStatus.dataobject === 'complete' || moduleStatus.software === 'complete') &&
        moduleStatus.publication === 'complete'
      );
    }
    
    return (
      moduleStatus.core === 'complete' &&
      (moduleStatus.dataobject === 'complete' || moduleStatus.software === 'complete')
    );
  }, [moduleStatus, state.template]);

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
