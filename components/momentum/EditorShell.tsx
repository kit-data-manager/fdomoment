'use client';

import React from 'react';
import { EditorState } from '@/lib/momentum/types';
import { EditorNavigator } from './navigator/EditorNavigator';
import { CoreModule } from './modules/CoreModule';
import { TemplateSelection } from './modules/TemplateSelection';
import { DataObjectModule } from './modules/DataObjectModule';
import { SoftwareModule } from './modules/SoftwareModule';
import { PublicationModule } from './modules/PublicationModule';
import { AdditionalAttributesModule } from './modules/AdditionalAttributesModule';
import { FairScoreBar } from './FairScoreBar';

interface EditorShellProps {
  state: EditorState;
  updateBasis: (partial: Partial<any>) => void;
  updateDataset: (partial: Partial<any>) => void;
  updateSoftware: (partial: Partial<any>) => void;
  updatePublication: (partial: Partial<any>) => void;
  updateMisc: (entries: any[]) => void;
  setTemplate: (type: EditorState['template']) => void;
  setActiveModule: (module: string) => void;
  canCreate: boolean;
}

export function EditorShell(props: EditorShellProps) {
  const {
    state,
    updateBasis,
    updateDataset,
    updateSoftware,
    updatePublication,
    updateMisc,
    setTemplate,
    setActiveModule,
    canCreate,
  } = props;

  const handleCreate = () => {
    console.log('Creating FDO', state);
  };

  const handleCoreNext = () => {
    if (!state.template) {
      setActiveModule('template-select');
    } else {
      if (state.template === 'published-data-object' || state.template === 'unpublished-data-object') {
        setActiveModule('dataobject');
      } else if (state.template === 'published-software' || state.template === 'unpublished-software') {
        setActiveModule('software');
      }
    }
  };

  const handleTemplateSelect = (template: EditorState['template']) => {
    setTemplate(template);
    setActiveModule('core');
  };

  const showFullInterface = state.template !== null;

  const isDataObjectTemplate = state.template === 'published-data-object' || state.template === 'unpublished-data-object';
  const isSoftwareTemplate = state.template === 'published-software' || state.template === 'unpublished-software';

  const renderActiveModule = () => {
    switch (state.activeModule) {
      case 'core':
        return (
          <CoreModule
            basis={state.basis}
            updateBasis={updateBasis}
            onNext={handleCoreNext}
            objectType={isDataObjectTemplate ? 'dataobject' : isSoftwareTemplate ? 'software' : null}
          />
        );

      case 'template-select':
        return (
          <TemplateSelection
            onSelectTemplate={handleTemplateSelect}
          />
        );

      case 'dataobject':
        if (!isDataObjectTemplate) {
          setActiveModule('core');
          return null;
        }
        return (
          <DataObjectModule
            dataset={state.dataset}
            basis={state.basis}
            updateDataset={updateDataset}
            setActiveModule={setActiveModule as (module: string) => void}
          />
        );

      case 'software':
        if (!isSoftwareTemplate) {
          setActiveModule('core');
          return null;
        }
        return (
          <SoftwareModule
            software={state.software}
            updateSoftware={updateSoftware}
            setActiveModule={setActiveModule as (module: string) => void}
          />
        );

      case 'publication':
        if (!state.publication) return null;
        return (
          <PublicationModule
            publication={state.publication}
            updatePublication={updatePublication}
          />
        );

      case 'misc':
        if (!state.misc) return null;
        return (
          <AdditionalAttributesModule
            misc={state.misc}
            researchDomain={state.basis.researchDomain}
            updateMisc={updateMisc}
          />
        );

      default:
        return null;
    }
  };

  if (!showFullInterface) {
    return renderActiveModule();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="hidden md:flex flex-1 overflow-hidden">
        <EditorNavigator
          state={state}
          moduleStatus={state.moduleStatus}
          setActiveModule={setActiveModule}
          canCreate={canCreate}
          onCreate={handleCreate}
        />
        <main className="flex-1 overflow-y-auto bg-base-200">
          <div className="flex gap-6 p-8">
            <div className="flex-1 max-w-2xl">
              {renderActiveModule()}
            </div>
            <div className="w-[300px] flex-shrink-0">
              <FairScoreBar
                state={state}
                setActiveModule={setActiveModule}
              />
            </div>
          </div>
        </main>
      </div>

      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-base-200 p-4">
          {renderActiveModule()}
          <div className="mt-4">
            <FairScoreBar
              state={state}
              setActiveModule={setActiveModule as (module: string) => void}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
