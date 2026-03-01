"use client";
import React, { useState, useEffect } from 'react';
import BasicSection from './BasicSection';
import DatasetSection from './DatasetSection';
import AdditionalSection from './AdditionalSection';
import { Icon } from '@iconify/react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
  onAdd: () => void;
  onTitleChange: (id: number | undefined, title: string) => void;
  isLast: boolean;
  availableTypes: string[];
}

const Section: React.FC<SectionProps> = ({ title, children, onRemove, onAdd, onTitleChange, isLast, availableTypes }) => {
  return (
    <div className="section-container p-4 rounded-lg border mb-4">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">{title}</h3>
      {children}
      {isLast && (
        <div className="section-actions flex justify-end items-center gap-2">
          {title != "Basic" && (
          <button
            onClick={onRemove}
            className="btn btn-ghost btn-sm mt-2"
            title="Remove module"
          >
            <Icon icon="mdi:delete" width="20" height="20" />
          </button>
          )}
          {availableTypes.length > 0 && (
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  onAdd();
                  // Pass undefined as id to indicate new section
                  onTitleChange(undefined, e.target.value);
                }
              }}
              className="select select-bordered select-sm"
              title="Select section type to add"
            >
              <option value="">Add Module After</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
        </div>
      )}
      {!isLast && title != "Basic" && (
        <div className="section-actions flex justify-end items-center gap-2">
          <button 
            onClick={onRemove}
            className="btn btn-ghost btn-sm"
            title="Remove module"
          >
            <Icon icon="mdi:delete" width="20" height="20" />
          </button>
        </div>
      )}
    </div>
  );
};

const FdoEditor: React.FC = () => {
  const [sections, setSections] = useState([
    { id: 1, title: 'Basic' },
    { id: 2, title: 'Dataset' },
    { id: 3, title: 'Additional' }
  ]);
  
  // State to hold all section data
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  
  // Theme state is now managed in ThemeContext

  // Get available section types (those not already in sections)
  const availableSectionTypes = ['Basic', 'Dataset', 'Additional'].filter(
    type => !sections.some(section => section.title === type)
  );

  const handleRemoveSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleTitleChange = (id: number | undefined, title: string) => {
    // If this is called with a new section, create it
    if (id === undefined) {
      const newId = Math.max(...sections.map(s => s.id), 0) + 1;
      setSections([...sections, { id: newId, title }]);
    } else {
      // Otherwise, update the existing section
      setSections(sections.map(section => section.id === id ? { ...section, title } : section));
    }
  };

  // Function to update section data
  const updateSectionData = (sectionTitle: string, data: any) => {
    setSectionData(prev => ({
      ...prev,
      [sectionTitle]: data
    }));
  };

  // Collect all data
  const collectData = () => {
    return sectionData;
  };

  return (
    <div className="p-4 rounded-lg shadow-md">
      {sections.map((section, index) => (
        <Section
          key={section.id}
          title={section.title}
          onRemove={() => handleRemoveSection(section.id)}
          onAdd={() => {}}
          onTitleChange={(id, title) => handleTitleChange(id, title)}
          isLast={index === sections.length - 1}
          availableTypes={availableSectionTypes}
        >
          {section.title === 'Basic' && (
            <BasicSection onDataChange={(data) => updateSectionData('Basic', data)} />
          )}
          {section.title === 'Dataset' && (
            <DatasetSection onDataChange={(data) => updateSectionData('Dataset', data)} />
          )}
          {section.title === 'Additional' && (
            <AdditionalSection onDataChange={(data) => updateSectionData('Additional', data)} />
          )}
        </Section>
      ))}
      <div className="section-actions mt-4 flex justify-end">
        <button 
          className="btn btn-primary"
          onClick={() => console.debug(JSON.stringify(collectData(),null, 4))}
        >
          Collect Data
        </button>
      </div>
    </div>
  );
};

export default FdoEditor;
