'use client';

import React from 'react';
import { EditorState } from '@/lib/momentum/types';
import { EditorNavigator } from './navigator/EditorNavigator';
import { CoreModule } from './modules/CoreModule';
import { WelcomeStep } from './modules/WelcomeStep';
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
  setObjectType: (type: EditorState['objectType']) => void;
  setActiveModule: (module: string) => void;
  activatePublication: () => void;
  activateMisc: () => void;
  deactivatePublication: () => void;
  deactivateMisc: () => void;
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
    setObjectType,
    setActiveModule,
    activatePublication,
    activateMisc,
    deactivatePublication,
    deactivateMisc,
    canCreate,
  } = props;

  const handleCreate = () => {
    // TODO: Implement FDO creation
    console.log('Creating FDO', state);
  };

  const handleBasisNext = () => {
    setActiveModule('type-select');
  };

  const renderActiveModule = () => {
    switch (state.activeModule) {
      case 'core':
        return (
          <CoreModule
            basis={state.basis}
            updateBasis={updateBasis}
            onNext={handleBasisNext}
            objectType={state.objectType}
          />
        );

      case 'type-select':
        return (
          <WelcomeStep
            setObjectType={setObjectType}
            setActiveModule={setActiveModule as (module: string) => void}
            currentObjectType={state.objectType}
          />
        );

      case 'dataobject':
        if (!state.objectType || state.objectType === 'software') {
          setActiveModule('type-select');
          return null;
        }
        return (
          <DataObjectModule
            dataset={state.dataset}
            basis={state.basis}
            updateDataset={updateDataset}
            activatePublication={activatePublication}
            setActiveModule={setActiveModule as (module: string) => void}
          />
        );

      case 'software':
        if (!state.objectType || state.objectType === 'dataobject') {
          setActiveModule('type-select');
          return null;
        }
        return (
          <SoftwareModule
            software={state.software}
            updateSoftware={updateSoftware}
            activatePublication={activatePublication}
            setActiveModule={setActiveModule as (module: string) => void}
          />
        );

      case 'publication':
        if (!state.publication) return null;
        return (
          <PublicationModule
            publication={state.publication}
            updatePublication={updatePublication}
            onDeactivate={deactivatePublication}
          />
        );

      case 'misc':
        if (!state.misc) return null;
        return (
          <AdditionalAttributesModule
            misc={state.misc}
            researchDomain={state.basis.researchDomain}
            updateMisc={updateMisc}
            onDeactivate={deactivateMisc}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <EditorNavigator
          state={state}
          moduleStatus={state.moduleStatus}
          setActiveModule={setActiveModule}
          activatePublication={activatePublication}
          activateMisc={activateMisc}
          setObjectType={setObjectType}
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

      {/* Mobile Layout */}
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
