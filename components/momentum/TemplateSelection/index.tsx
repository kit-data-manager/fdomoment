'use client';

import React, { useState } from 'react';
import { useTemplateSelection } from './useTemplateSelection';
import { TemplateSelectionProps, TEMPLATES, TemplateConfig } from './types';

const moduleLabels: Record<string, string> = {
  core: 'Core',
  dataobject: 'Data Object',
  software: 'Software',
  publication: 'Publication',
  misc: 'Additional',
};

export function TemplateSelection({
  onSelectTemplate,
}: TemplateSelectionProps) {
  const { handleSelectTemplate } = useTemplateSelection({ onSelectTemplate });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({});

  const handleTemplateClick = (template: TemplateConfig) => {
    const initialActiveModules: Record<string, boolean> = {};
    template.modules.forEach(mod => {
      if (mod.selectable) {
        initialActiveModules[mod.moduleId] = activeModules[mod.moduleId] ?? true;
      } else {
        initialActiveModules[mod.moduleId] = true;
      }
    });
    setActiveModules(initialActiveModules);
    setSelectedTemplate(template);
  };

  const toggleModule = (moduleId: string) => {
    setActiveModules(prev => {
      const current = prev[moduleId] !== false;
      return {
        ...prev,
        [moduleId]: !current,
      };
    });
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      const enabledModules = selectedTemplate.modules
        .filter(mod => activeModules[mod.moduleId] !== false)
        .map(mod => mod.moduleId);
      handleSelectTemplate(selectedTemplate.id, enabledModules);
    }
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setActiveModules({});
  };

  if (selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">{selectedTemplate.icon}</div>
          <h2 className="text-2xl font-bold">
            {selectedTemplate.label}
          </h2>
          <p className="text-base-content/70">
            {selectedTemplate.description}
          </p>
          
          <div className="text-left rounded-lg p-4">
            <h3 className="font-semibold mb-2">Enabled Modules:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.modules
                .filter(mod => activeModules[mod.moduleId] !== false)
                .map(mod => (
                  <span
                    key={mod.moduleId}
                    className="badge badge-primary badge-sm"
                  >
                    {moduleLabels[mod.moduleId]}
                  </span>
                ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBack}
              className="btn btn-soft"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="btn btn-primary btn-soft"
            >
              Confirm →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          What do you want to describe?
        </h2>
        <p className="text-base-content/70">
          Choose the template that best matches your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full px-4">
        {TEMPLATES.map((template: any) => {
          return (
            <div
              key={template.id}
              className="card bg-base-100 transition-all p-6 border border-base-200 hover:border-primary cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{template.label}</h3>
                  <p className="text-xs text-base-content/70 mt-1 h-12 line-clamp-3">
                    {template.description}
                  </p>
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {template.modules.map((mod: any) => {
                      const isActive = activeModules[mod.moduleId] ?? (mod.selectable ? true : null);
                      if (mod.selectable) {
                        return (
                          <button
                            key={mod.moduleId}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModule(mod.moduleId);
                            }}
                            className={`badge badge-xs cursor-pointer transition-all ${
                              isActive
                                ? 'badge-info hover:opacity-80'
                                : 'badge-ghost hover:badge-info'
                            }`}
                          >
                            {moduleLabels[mod.moduleId]}
                          </button>
                        );
                      }
                      return (
                        <span
                          key={mod.moduleId}
                          className="badge badge-xs badge-outline"
                        >
                          {moduleLabels[mod.moduleId]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
