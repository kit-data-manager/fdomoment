'use client';

import React from 'react';
import { EditorState } from '@/lib/momentum/types';
import { NavigatorModule } from './NavigatorModule';
import { NavigatorCreateButton } from './NavigatorCreateButton';

interface EditorNavigatorProps {
  state: EditorState;
  moduleStatus: EditorState['moduleStatus'];
  setActiveModule: (module: string) => void;
  activatePublication: () => void;
  activateMisc: () => void;
  setObjectType: (type: EditorState['objectType']) => void;
  canCreate: boolean;
  onCreate: () => void;
}

export function EditorNavigator({
  state,
  moduleStatus,
  setActiveModule,
  activatePublication,
  activateMisc,
  setObjectType,
  canCreate,
  onCreate,
}: EditorNavigatorProps) {
  return (
    <div className="w-[240px] h-full bg-base-100 border-r border-base-200 overflow-y-auto flex flex-col">
      {/* Mandatory */}
      <NavigatorModule
        module="core"
        status={moduleStatus.core}
        label="Core"
        isActive={state.activeModule === 'core'}
        onClick={() => setActiveModule('core')}
      />

      {/* Divider: Select type */}
      <div className="px-4 py-3">
        <div className="text-xs opacity-50 mb-2 px-2">Typ wählen</div>
        <NavigatorModule
          module="dataobject"
          status={state.objectType === null ? 'pristine' : moduleStatus.dataobject}
          label="Data Object"
          isActive={state.activeModule === 'type-select' && state.objectType === 'dataobject' || state.activeModule === 'dataobject'}
          onClick={() => {
            if (state.objectType === null) {
              setActiveModule('type-select');
            } else {
              if (state.objectType === 'software') {
                setObjectType('dataobject');
              }
              setActiveModule('dataobject');
            }
          }}
        />
        <NavigatorModule
          module="software"
          status={state.objectType === null ? 'pristine' : moduleStatus.software}
          label="Software"
          isActive={state.activeModule === 'type-select' && state.objectType === 'software' || state.activeModule === 'software'}
          onClick={() => {
            if (state.objectType === null) {
              setActiveModule('type-select');
            } else {
              if (state.objectType === 'dataobject') {
                setObjectType('software');
              }
              setActiveModule('software');
            }
          }}
        />
        {state.objectType === null && (
          <div className="text-xs opacity-50 mt-2 px-2">
            Select one of both.
          </div>
        )}
      </div>

      {/* Divider: Optional */}
      <div className="px-4 py-3 border-t border-base-200">
        <div className="text-xs opacity-50 mb-2 px-2">Optional</div>
        <NavigatorModule
          module="publication"
          status={moduleStatus.publication}
          label="Publication"
          isActive={state.activeModule === 'publication'}
          onClick={() => setActiveModule('publication')}
          isOptional={!state.publication}
          onActivate={() => {
            activatePublication();
          }}
        />
        <NavigatorModule
          module="misc"
          status={moduleStatus.misc}
          label="Additional Metadaten"
          isActive={state.activeModule === 'misc'}
          onClick={() => setActiveModule('misc')}
          isOptional={!state.misc}
          onActivate={() => {
            activateMisc();
          }}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Create Button */}
      <div className="p-4 border-t border-base-200">
        <NavigatorCreateButton canCreate={canCreate} onClick={onCreate} />
      </div>
    </div>
  );
}
