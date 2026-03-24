'use client';

import React from 'react';
import { EditorState } from '@/lib/momentum/types';
import { EditorNavigator } from './navigator/EditorNavigator';
import { CoreModule } from './CoreModule';
import { FairScoreBar } from './FairScoreBar';
import {TemplateSelection} from "./TemplateSelection";
import {DataObjectModule} from "./DataObjectModule";
import {SoftwareModule} from "./SoftwareModule";
import {PublicationModule} from "./PublicationModule";
import {AdditionalAttributesModule} from "./AdditionalAttributesModule";

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
      if (state.template === 'published-dataobject' || state.template === 'unpublished-dataobject') {
        setActiveModule('dataobject');
      } else if (state.template === 'published-software' || state.template === 'unpublished-software') {
        setActiveModule('software');
      }else if (state.template === 'published-publication') {
          setActiveModule('publication');
      }
    }
  };

  const handleTemplateSelect = (template: EditorState['template']) => {
    setTemplate(template);
    setActiveModule('core');
  };

  const showFullInterface = state.template !== null;

  const isDataObjectTemplate = state.template === 'published-dataobject' || state.template === 'unpublished-dataobject';
  const isSoftwareTemplate = state.template === 'published-software' || state.template === 'unpublished-software';

  const renderActiveModule = () => {
      switch (state.activeModule) {
      case 'core':
        return (
          <CoreModule
            basis={state.core}
            updateCore={updateBasis}
            onNext={handleCoreNext}
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
            dataobject={state.dataobject}
            core={state.core}
            updateDataobject={updateDataset}
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
            researchDomain={state.core.researchDomain}
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
