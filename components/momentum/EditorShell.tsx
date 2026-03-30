'use client';

import React from 'react';
import { EditorState } from '@/lib/momentum/types';
import { EditorNavigator } from '@/components/momentum/Navigator/EditorNavigator';
import { CoreModule } from '@/components/momentum/CoreModule';
import { FairScoreBar } from '@/components/momentum/FairScoreBar';
import {TemplateSelection} from "@/components/momentum/TemplateSelection";
import {DataObjectModule} from "@/components/momentum/DataObjectModule";
import {SoftwareModule} from "@/components/momentum/SoftwareModule";
import {PublicationModule} from "./PublicationModule";
import {AdditionalAttributesModule} from "@/components/momentum/AdditionalAttributesModule";

interface EditorShellProps {
  state: EditorState;
  updateBasis: (partial: Partial<any>) => void;
  updateDataset: (partial: Partial<any>) => void;
  updateSoftware: (partial: Partial<any>) => void;
  updatePublication: (partial: Partial<any>) => void;
  updateMisc: (entries: any[]) => void;
  setTemplate: (type: EditorState['template'], enabledModules?: string[]) => void;
  setActiveModule: (module: string) => void;
  canCreate: boolean;
  onNextModule?: () => void;
  onPrevModule?: () => void;
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

  const moduleOrder = ['core', 'dataobject', 'software', 'publication', 'misc'];
  
  const getCurrentModuleIndex = () => {
    return moduleOrder.indexOf(state.activeModule);
  };

  const handleCoreNext = () => {
    if (!state.template) {
      setActiveModule('template-select');
    } else if (state.template === 'dataobject') {
      setActiveModule('dataobject');
    } else if (state.template === 'software') {
      setActiveModule('software');
    } else if (state.template === 'publication') {
      setActiveModule('publication');
    }
  };

  const handleNextModule = () => {
    const currentIndex = getCurrentModuleIndex();
    // Find the next enabled module
    for (let i = currentIndex + 1; i < moduleOrder.length; i++) {
      if (state.enabledModules.includes(moduleOrder[i])) {
        setActiveModule(moduleOrder[i]);
        break;
      }
    }
  };

  const handlePrevModule = () => {
    const currentIndex = getCurrentModuleIndex();
    // Find the previous enabled module
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (state.enabledModules.includes(moduleOrder[i]) || moduleOrder[i] === 'core') {
        setActiveModule(moduleOrder[i]);
        break;
      }
    }
  };

  const handleTemplateSelect = (templateId: string, enabledModules: string[]) => {
    setTemplate(templateId as any, enabledModules);
    setActiveModule('core');
  };

  const showFullInterface = state.template !== null;

  const renderActiveModule = () => {
      switch (state.activeModule) {
      case 'core':
        return (
          <CoreModule
            basis={state.core}
            updateCore={updateBasis}
            onNext={handleCoreNext}
            showNext={true}
            showPrev={false}
            onNextModule={handleNextModule}
            onPrevModule={handlePrevModule}
          />
        );

      case 'template-select':
        return (
          <TemplateSelection
            onSelectTemplate={handleTemplateSelect}
          />
        );

      case 'dataobject':
        return (
          <DataObjectModule
            dataobject={state.dataobject}
            core={state.core}
            updateDataobject={updateDataset}
            setActiveModule={setActiveModule as (module: string) => void}
            showNext={state.enabledModules.some(m => ['software', 'publication', 'misc'].includes(m))}
            showPrev={true}
            onNextModule={handleNextModule}
            onPrevModule={handlePrevModule}
          />
        );

      case 'software':
        return (
          <SoftwareModule
            software={state.software}
            updateSoftware={updateSoftware}
            setActiveModule={setActiveModule as (module: string) => void}
            showNext={state.enabledModules.some(m => ['publication', 'misc'].includes(m))}
            showPrev={true}
            onNextModule={handleNextModule}
            onPrevModule={handlePrevModule}
          />
        );

      case 'publication':
        if (!state.publication) return null;
        return (
          <PublicationModule
            publication={state.publication}
            updatePublication={updatePublication}
            showNext={state.enabledModules.includes('misc')}
            showPrev={true}
            onNextModule={handleNextModule}
            onPrevModule={handlePrevModule}
          />
        );

      case 'misc':
        if (!state.misc) return null;
        return (
          <AdditionalAttributesModule
            misc={state.misc}
            researchDomain={state.core.researchDomain}
            updateMisc={updateMisc}
            showNext={false}
            showPrev={true}
            onNextModule={handleNextModule}
            onPrevModule={handlePrevModule}
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
