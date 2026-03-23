'use client';

import { useState, useMemo } from 'react';
import {
  EditorState,
  BasisData,
  DatasetData,
  SoftwareData,
  PublicationData,
  MiscData,
  MiscEntry,
  ObjectType,
  ModuleStatus,
} from '@/lib/momentum/types';
import {
  computeBasisStatus,
  computeDatasetStatus,
  computeSoftwareStatus,
  computePublicationStatus,
  computeMiscStatus,
} from '@/lib/momentum/validation';

function createInitialState(): EditorState {
  return {
    objectType: null,
    activeModule: 'basis',
    basis: {
      researchDomain: null,
      orcid: '',
      orcidName: null,
      orcidInstitution: null,
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
      basis: 'incomplete',
      dataset: 'pristine',
      software: 'pristine',
      publication: 'pristine',
      misc: 'pristine',
    },
  };
}

export function useEditorState() {
  const [state, setState] = useState<EditorState>(createInitialState());

  const updateBasis = (partial: Partial<BasisData>) => {
    setState(prev => ({
      ...prev,
      basis: { ...prev.basis, ...partial },
    }));
  };

  const updateDataset = (partial: Partial<DatasetData>) => {
    setState(prev => ({
      ...prev,
      dataset: { ...prev.dataset, ...partial },
    }));
  };

  const updateSoftware = (partial: Partial<SoftwareData>) => {
    setState(prev => ({
      ...prev,
      software: { ...prev.software, ...partial },
    }));
  };

  const updatePublication = (partial: Partial<PublicationData>) => {
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

  const setObjectType = (type: ObjectType) => {
    setState(prev => ({
      ...prev,
      objectType: type,
    }));
  };

  const setActiveModule = (module: EditorState['activeModule']) => {
    setState(prev => ({
      ...prev,
      activeModule: module,
    }));
  };

  const activatePublication = () => {
    setState(prev => ({
      ...prev,
      publication: {
        doi: '',
        title: '',
        titleImported: false,
        publicationType: '',
        publicationTypeImported: false,
        creators: [],
        creatorsImported: false,
      },
      activeModule: 'publication',
    }));
  };

  const activateMisc = () => {
    setState(prev => ({
      ...prev,
      misc: { entries: [] },
      activeModule: 'misc',
    }));
  };

  const deactivatePublication = () => {
    setState(prev => ({
      ...prev,
      publication: null,
    }));
  };

  const deactivateMisc = () => {
    setState(prev => ({
      ...prev,
      misc: null,
    }));
  };

  const moduleStatus = useMemo<EditorState['moduleStatus']>(() => {
    return {
      basis: computeBasisStatus(state.basis),
      dataset: computeDatasetStatus(state.dataset, state.objectType),
      software: computeSoftwareStatus(state.software, state.objectType),
      publication: computePublicationStatus(state.publication),
      misc: computeMiscStatus(state.misc),
    };
  }, [state.basis, state.dataset, state.software, state.publication, state.misc, state.objectType]);

  const canCreate = useMemo(() => {
    return (
      moduleStatus.basis === 'complete' &&
      (moduleStatus.dataset === 'complete' ||
       moduleStatus.software === 'complete')
    );
  }, [moduleStatus]);

  return {
    state: { ...state, moduleStatus },
    updateBasis,
    updateDataset,
    updateSoftware,
    updatePublication,
    updateMisc,
    setObjectType,
    setActiveModule,
    activatePublication,
    activateMisc,
    deactivatePublication,
    deactivateMisc,
    canCreate,
  };
}
