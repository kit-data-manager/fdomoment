'use client';

import React from 'react';
import { EditorState,  ModuleIdentifier } from '@/lib/momentum/types';
import { NavigatorModule } from './NavigatorModule';
import { NavigatorCreateButton } from './NavigatorCreateButton';
import { TEMPLATES } from '../TemplateSelection/types';

interface EditorNavigatorProps {
  state: EditorState;
  moduleStatus: EditorState['moduleStatus'];
  setActiveModule: (module: string) => void;
  canCreate: boolean;
  onCreate: () => void;
}

const moduleLabels: Record<ModuleIdentifier, string> = {
  core: 'Core',
  dataobject: 'Data Object',
  software: 'Software',
  publication: 'Publication',
  misc: 'Additional',
};

function getModulesForTemplate(templateId: string | null, enabledModules?: string[]): ModuleIdentifier[] {
  if (!templateId) return [];
  const tmpl = TEMPLATES.find(t => t.id === templateId);
  if (!tmpl) return [];

  if (enabledModules && enabledModules.length > 0) {
    return enabledModules as ModuleIdentifier[];
  }

  return tmpl.modules.map(m => m.moduleId);
}

export function EditorNavigator({
  state,
  moduleStatus,
  setActiveModule,
  canCreate,
  onCreate,
}: EditorNavigatorProps) {
  const modules = getModulesForTemplate(state.template, state.enabledModules);

  return (
    <div className="w-[240px] h-full bg-base-100 border-r border-base-200 overflow-y-auto flex flex-col">
      {modules.map((module) => (
        <NavigatorModule
          key={module}
          module={module}
          status={moduleStatus[module]}
          label={moduleLabels[module]}
          isActive={state.activeModule === module}
          onClick={() => setActiveModule(module)}
        />
      ))}

      <div className="flex-1" />

      <div className="p-4 border-t border-base-200">
        <NavigatorCreateButton canCreate={canCreate} onClick={onCreate} />
      </div>
    </div>
  );
}
