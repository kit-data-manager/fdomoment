'use client';

import React from 'react';
import { TemplateType, TemplateConfig } from '@/lib/momentum/types';

interface TemplateSelectionProps {
  onSelectTemplate: (template: TemplateType) => void;
}

const templates: TemplateConfig[] = [
  {
    type: 'published-data-object',
    label: 'Published Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data with publication',
    icon: '🗄️',
    modules: ['core', 'dataobject', 'publication', 'misc'],
  },
  {
    type: 'unpublished-data-object',
    label: 'Unpublished Data Object',
    description: 'Measurement, Surveys, Images, Tables, or Simulation Data without publication',
    icon: '🗄️',
    modules: ['core', 'dataobject', 'misc'],
  },
  {
    type: 'published-software',
    label: 'Published Software',
    description: 'Source Code, Workflows, Tools, Scripts with publication',
    icon: '💻',
    modules: ['core', 'software', 'publication', 'misc'],
  },
  {
    type: 'unpublished-software',
    label: 'Unpublished Software',
    description: 'Source Code, Workflows, Tools, Scripts without publication',
    icon: '💻',
    modules: ['core', 'software', 'misc'],
  },
];

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
  const handleSelect = (template: TemplateType) => {
    onSelectTemplate(template);
  };

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
          {templates.map((template) => (
            <label
              key={template.type}
              className="card bg-base-100 border-2 border-base-200 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary"
            >
              <input
                type="radio"
                name="template"
                className="sr-only"
                onChange={() => handleSelect(template.type)}
              />
              <figure className="px-4 pt-4 flex justify-center gap-4">
                <div className="text-5xl">{template.icon}</div>
              </figure>
              <div className="card-body items-center text-center">
                <h2 className="card-title text-xl">{template.label}</h2>
                <p className="text-sm text-base-content/70">
                  {template.description}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {template.modules.map((module) => (
                    <span key={module} className="badge badge-sm badge-outline">
                      {moduleLabels[module]}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
