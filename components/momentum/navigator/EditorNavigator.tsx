'use client';

import React from 'react';
import { EditorState, TemplateConfig, ModuleIdentifier } from '@/lib/momentum/types';
import { NavigatorModule } from './NavigatorModule';
import { NavigatorCreateButton } from './NavigatorCreateButton';

interface EditorNavigatorProps {
  state: EditorState;
  moduleStatus: EditorState['moduleStatus'];
  setActiveModule: (module: string) => void;
  canCreate: boolean;
  onCreate: () => void;
}

const templates: TemplateConfig[] = [
  {
    type: 'published-dataobject',
    baseType: 'dataobject',
    label: 'Published Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data with publication',
    icon: '🗄️',
    baseModules: ['core', 'dataobject', 'publication', 'misc'],
    supportsPublication: true,
  },
  {
    type: 'unpublished-dataobject',
    baseType: 'dataobject',
    label: 'Unpublished Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data without publication',
    icon: '🗄️',
    baseModules: ['core', 'dataobject', 'misc'],
    supportsPublication: false,
  },
  {
    type: 'published-software',
    baseType: 'software',
    label: 'Published Software',
    description: 'Source Code, Workflows, Tools, Scripts with publication',
    icon: '💻',
    baseModules: ['core', 'software', 'publication', 'misc'],
    supportsPublication: true,
  },
  {
    type: 'unpublished-software',
    baseType: 'software',
    label: 'Unpublished Software',
    description: 'Source Code, Workflows, Tools, Scripts without publication',
    icon: '💻',
    baseModules: ['core', 'software', 'misc'],
    supportsPublication: false,
  },
    {
        type: 'published-publication',
        baseType: 'publication',
        label: 'Publication',
        description: 'Papers, Articles',
        icon: '💻',
        baseModules: ['core', 'publication', 'misc'],
        supportsPublication: true,
    }
];

const moduleLabels: Record<ModuleIdentifier, string> = {
  core: 'Core',
  dataobject: 'Data Object',
  software: 'Software',
  publication: 'Publication',
  misc: 'Additional',
};

function getModulesForTemplate(template: EditorState['template']): ModuleIdentifier[] {
  if (!template) return [];
  const tmpl = templates.find(t => t.type === template);
  if (!tmpl) return [];

  return tmpl.baseModules;
}

export function EditorNavigator({
  state,
  moduleStatus,
  setActiveModule,
  canCreate,
  onCreate,
}: EditorNavigatorProps) {
  const modules = getModulesForTemplate(state.template);

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
