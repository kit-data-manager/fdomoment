'use client';

import React, { useState } from 'react';
import { TemplateType, TemplateConfig, ModuleIdentifier } from '@/lib/momentum/types';
import { useTemplateSelection } from './useTemplateSelection';
import { TemplateSelectionProps, TEMPLATES } from './types';

const moduleLabels: Record<ModuleIdentifier, string> = {
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
  const [withPublication, setWithPublication] = useState<{
    dataobject: boolean;
    software: boolean;
  }>({
    dataobject: true,
    software: true,
  });

  const togglePublication = (baseType: 'dataobject' | 'software') => {
    setWithPublication(prev => ({
      ...prev,
      [baseType]: !prev[baseType],
    }));
  };

  const handleSelect = (baseType: 'dataobject' | 'software') => {
    const type: TemplateType = withPublication[baseType]
      ? baseType === 'dataobject'
        ? 'published-dataobject'
        : 'published-software'
      : baseType === 'dataobject'
        ? 'unpublished-dataobject'
        : 'unpublished-software';
    handleSelectTemplate(type);
  };

  const baseTemplates = TEMPLATES.filter(t => t.baseType !== 'publication');

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
        {(['dataobject', 'software'] as const).map((baseType) => {
          const template = baseTemplates.find(t => t.baseType === baseType);
          if (!template) return null;

          const hasPublication = withPublication[baseType];

          return (
            <div
              key={baseType}
              className="card bg-base-100 transition-all p-6 border border-base-200 hover:border-primary cursor-pointer"
              onClick={() => handleSelect(baseType)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{template.label}</h3>
                  <p className="text-xs text-base-content/70 mt-1 h-8 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {template.baseModules.map((module) => {
                      if (module === 'publication') {
                        return (
                          <button
                            key={module}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePublication(baseType);
                            }}
                            className={`badge badge-xs cursor-pointer transition-all ${
                              hasPublication
                                ? 'badge-info hover:opacity-80'
                                : 'badge-ghost hover:badge-info'
                            }`}
                          >
                            {hasPublication ? '+publication ✓' : '+publication'}
                          </button>
                        );
                      }
                      return (
                        <span
                          key={module}
                          className="badge badge-xs badge-outline"
                        >
                          {moduleLabels[module]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Publication-only template */}
        {(() => {
          const pubTemplate = TEMPLATES.find(t => t.type === 'published-publication');
          if (!pubTemplate) return null;

          return (
            <button
              key="publication"
              type="button"
              onClick={() => handleSelectTemplate('published-publication')}
              className="card bg-base-100 hover:bg-base-200 transition-all p-6 text-left border border-base-200 hover:border-primary"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{pubTemplate.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{pubTemplate.label}</h3>
                  <p className="text-xs text-base-content/70 mt-1 h-8 line-clamp-2">
                    {pubTemplate.description}
                  </p>
                  <div className="mt-3 flex gap-1 flex-wrap">
                    {pubTemplate.baseModules.map((module) => (
                      <span
                        key={module}
                        className="badge badge-xs badge-outline"
                      >
                        {moduleLabels[module]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })()}
      </div>
    </div>
  );
}
