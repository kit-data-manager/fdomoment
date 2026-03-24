'use client';

import React, { useState } from 'react';
import { TemplateType, TemplateConfig, ModuleIdentifier } from '@/lib/momentum/types';

interface TemplateSelectionProps {
  onSelectTemplate: (template: TemplateType) => void;
}

const templates: TemplateConfig[] = [
  {
    type: 'published-dataobject',
    baseType: 'dataobject',
    label: 'Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data',
    icon: '🗄️',
    baseModules: ['core', 'dataobject', 'misc'],
    supportsPublication: true,
  },
  {
    type: 'published-software',
    baseType: 'software',
    label: 'Software',
    description: 'Source Code, Workflows, Tools, Scripts',
    icon: '💻',
    baseModules: ['core', 'software', 'misc'],
    supportsPublication: true,
  },
  {
    type: 'unpublished-dataobject',
    baseType: 'dataobject',
    label: 'Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data',
    icon: '🗄️',
    baseModules: ['core', 'dataobject', 'misc'],
    supportsPublication: false,
  },
  {
    type: 'unpublished-software',
    baseType: 'software',
    label: 'Software',
    description: 'Source Code, Workflows, Tools, Scripts',
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
    },
];

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
  const [includePublication, setIncludePublication] = useState<{
    dataobject: boolean;
    software: boolean;
    publication: boolean;
  }>({
    dataobject: true,
    software: true,
    publication: true,
  });

  const handleSelect = (baseType: 'dataobject' | 'software' | 'publication', withPublication: boolean) => {
    if(baseType === 'publication') {
        onSelectTemplate('published-publication');
    }else{
      const type: TemplateType = withPublication
      ? baseType === 'dataobject'
        ? 'published-dataobject'
        : 'published-software'
      : baseType === 'dataobject'
        ? 'unpublished-dataobject'
        : 'unpublished-software';
    onSelectTemplate(type);
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.baseType]) {
      acc[template.baseType] = [];
    }
    acc[template.baseType].push(template);
    return acc;
  }, {} as Record<'dataobject' | 'software' | 'publication', TemplateConfig[]>);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Create your research object
          </h1>
          <p className="text-lg text-base-content/70">
            Choose a template to get started. Your choice determines which metadata modules are available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['dataobject', 'software', 'publication'] as const).map((baseType) => {
            const template = groupedTemplates[baseType].find(t => 
              includePublication[baseType] 
                ? t.type === `published-${baseType}`
                : t.type === `unpublished-${baseType}`
            );

            if (!template) return null;

            const hasPublication = includePublication[baseType];
            const modules: ModuleIdentifier[] = hasPublication
              ? [...template.baseModules]
              : template.baseModules.filter(m => m !== 'publication');

            return (
              <div
                key={baseType}
                className="card bg-base-100 border-2 border-base-200 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="card-body">
                  <figure className="flex justify-center gap-4 mb-2">
                    <div className="text-5xl">{template.icon}</div>
                  </figure>
                  <h2 className="card-title text-xl text-center">{template.label}</h2>
                  <p className="text-sm text-base-content/70 text-center">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-2 my-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={includePublication[baseType]}
                      disabled={template.baseType === 'publication'}
                      onChange={(e) =>
                        setIncludePublication(prev => ({
                          ...prev,
                          [baseType]: e.target.checked,
                        }))
                      }
                    />
                    <label className="label cursor-pointer">
                      <span className="label-text font-medium">Include Publication module</span>
                    </label>
                  </div>

                  <div className="flex gap-2 mt-2 flex-wrap justify-center">
                    {modules.map((module) => (
                      <span key={module} className="badge badge-sm badge-outline">
                        {moduleLabels[module]}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary mt-4"
                    onClick={() => handleSelect(baseType, includePublication[baseType])}
                  >
                    Select {template.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
