'use client';

import React, { useEffect, useId, useState } from 'react';
import { EditorState, ModuleIdentifier } from '@/lib/momentum/types';
import { NavigatorModule } from './NavigatorModule';
import { NavigatorCreateButton } from './NavigatorCreateButton';
import { getTemplateModuleIds, getModuleLabel } from '@/lib/momentum/registry';
import { Menu } from 'lucide-react';

interface EditorNavigatorProps {
  state: EditorState;
  moduleStatus: EditorState['moduleStatus'];
  setActiveModule: (module: string) => void;
  canCreate: boolean;
  onCreate: () => void;
  children: React.ReactNode;
}

function getModulesForTemplate(templateId: string | null, enabledModules?: string[]): ModuleIdentifier[] {
  if (!templateId) return [];
  const tplModuleIds = getTemplateModuleIds(templateId);
  if (tplModuleIds.length === 0) return [];

  if (enabledModules && enabledModules.length > 0) {
    return enabledModules as ModuleIdentifier[];
  }

  return tplModuleIds as ModuleIdentifier[];
}

export function EditorNavigator({
  state,
  moduleStatus,
  setActiveModule,
  canCreate,
  onCreate,
  children,
}: EditorNavigatorProps) {
  const modules = getModulesForTemplate(state.template, state.enabledModules);
  const drawerId = useId();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsOpen(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsOpen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleModuleClick = (module: string) => {
    setActiveModule(module);
    const mq = window.matchMedia('(min-width: 1024px)');
    if (!mq.matches) {
      setIsOpen(false);
    }
  };

  return (
    <div className="drawer lg:drawer-open h-full">
      <input
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={(e) => setIsOpen(e.target.checked)}
      />

      <div className="drawer-content flex flex-col h-full">
        <div className="lg:hidden p-2">
          <label htmlFor={drawerId} className="btn btn-ghost btn-sm btn-square">
            <Menu className="w-5 h-5" />
          </label>
        </div>
        {children}
      </div>

      <div className="drawer-side h-full z-20">
        <label htmlFor={drawerId} className="drawer-overlay" aria-label="Close sidebar" />
        <div className="w-[240px] h-full bg-base-100 border-r border-base-200 overflow-y-auto flex flex-col">
          {modules.map((module) => (
            <NavigatorModule
              key={module}
              module={module}
              status={moduleStatus[module]}
              label={getModuleLabel(module)}
              isActive={state.activeModule === module}
              onClick={() => handleModuleClick(module)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
