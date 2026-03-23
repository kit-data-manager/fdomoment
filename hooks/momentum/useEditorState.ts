'use client';

import { useState, useMemo } from 'react';
import {
  EditorState,
  CoreMetadata,
  DataObjectMetadata,
  SoftwareMetadata,
  PublicationMetadata,
  MiscMetadata,
  MiscEntry,
  ModuleStatus,
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
    basis: {
      researchDomain: null,
      orcid: '',
      orcidName: null,
      orcidEmail: null,
      orcidValidated: false,
    },
    dataset: {
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
    publication: null,
    misc: null,
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
      basis: { ...prev.basis, ...partial },
    }));
  };

  const updateDataset = (partial: Partial<DataObjectMetadata>) => {
    setState(prev => ({
      ...prev,
      dataset: { ...prev.dataset, ...partial },
    }));
  };

  const updateSoftware = (partial: Partial<SoftwareMetadata>) => {
    setState(prev => ({
      ...prev,
      software: { ...prev.software, ...partial },
    }));
  };

  const updatePublication = (partial: Partial<PublicationMetadata>) => {
    setState(prev => {
      if (!prev.publication) {
        return {
          ...prev,
          publication: {
            doi: '',
            title: '',
            titleImported: false,
            publicationType: '',
            publicationTypeImported: false,
            creators: [],
            creatorsImported: false,
            ...partial,
          },
        };
      }
      return {
        ...prev,
        publication: { ...prev.publication, ...partial },
      };
    });
  };

  const updateMisc = (entries: MiscEntry[]) => {
    setState(prev => ({
      ...prev,
      misc: { entries },
    }));
  };

  const setTemplate = (template: TemplateType) => {
    setState(prev => {
      const hasPublication = template === 'published-data-object' || template === 'published-software';
      const hasMisc = template !== null;
      
      return {
        ...prev,
        template,
        publication: hasPublication ? {
          doi: '',
          title: '',
          titleImported: false,
          publicationType: '',
          publicationTypeImported: false,
          creators: [],
          creatorsImported: false,
        } : null,
        misc: hasMisc ? { entries: [] } : null,
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
    const dataobjectTemplate: TemplateType = state.template === 'published-data-object' || state.template === 'unpublished-data-object' ? state.template : null;
    const softwareTemplate: TemplateType = state.template === 'published-software' || state.template === 'unpublished-software' ? state.template : null;
    
    return {
      core: computeCoreMetadataStatus(state.basis),
      dataobject: computeDataObjectMetadataStatus(state.dataset, dataobjectTemplate),
      software: computeSoftwareMetadataStatus(state.software, softwareTemplate),
      publication: computePublicationMetadataStatus(state.publication),
      misc: computeMiscMetadataStatus(state.misc),
    };
  }, [state.basis, state.dataset, state.software, state.publication, state.misc, state.template]);

  const canCreate = useMemo(() => {
    const hasPublication = state.template === 'published-data-object' || state.template === 'published-software';
    
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
