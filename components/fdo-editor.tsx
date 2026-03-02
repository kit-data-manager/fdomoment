"use client";
import React, { useState } from 'react';
import BasicSection from './BasicSection';
import DatasetSection from './DatasetSection';
import AdditionalSection from './AdditionalSection';
import { Icon } from '@iconify/react';
import TypedPropertiesSection from "@/components/TypedPropertiesSection";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
  onAdd: () => void;
  onTitleChange: (id: number | undefined, title: string) => void;
  isLast: boolean;
  availableTypes: string[];
  isActive: boolean;
  onClick: () => void;
}

const Section: React.FC<SectionProps> = ({ title, children, onRemove, onAdd, onTitleChange, isLast, availableTypes, isActive, onClick }) => {
  return (
    <div 
      className={`section-container p-4 rounded-lg border mb-4 transition-all duration-300 ${isActive ? 'z-10 scale-100' : 'z-0 scale-80 opacity-70'}`} 
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className={`text-lg font-semibold ${isActive ? 'cursor-pointer' : 'cursor-default'}`}>
          {title}
        </h3>
        {title != "Basic Properties" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="btn btn-ghost btn-sm"
            title="Remove module"
          >
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

const FdoEditor: React.FC = () => {
  const [sections, setSections] = useState([
    { id: 1, title: 'Basic Properties' },
    { id: 2, title: 'Dataset Properties' },
    { id: 3, title: 'Typed Properties' },
    { id: 4, title: 'Additional Properties' }
  ]);
  
  // State to hold all section data
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  
  // Theme state is now managed in ThemeContext

  // Get available section types (those not already in sections)
  const availableSectionTypes = ['Basic Properties', 'Dataset Properties', 'Typed Properties', 'Additional Properties'].filter(
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
            isActive={index === 0}
            onClick={() => {
              if (index !== 0) {
                // Move this section to the top
                const movedSection = sections[index];
                // Get the current top section
                const topSection = sections[0];
                // Create new array with the moved section at top, current top section at end, and other sections in between
                const remainingSections = sections.filter((_, i) => i !== index && i !== 0);
                setSections([movedSection, ...remainingSections, topSection]);
              }
            }}
          >
          {section.title === 'Basic Properties' && (
            <BasicSection onDataChange={(data) => updateSectionData('Basic Properties', data)} />
          )}
          {section.title === 'Dataset Properties' && (
            <DatasetSection onDataChange={(data) => updateSectionData('Dataset Properties', data)} />
          )}
          {section.title === 'Typed Properties' && (
                <TypedPropertiesSection onTypeSelected={(data) => updateSectionData('Typed Properties', data)} />
          )}
          {section.title === 'Additional Properties' && (
            <AdditionalSection onDataChange={(data) => updateSectionData('Additional Properties', data)} />
          )}
        </Section>
      ))}
       <div className="section-actions mt-4 flex justify-between items-center">
         <div className="flex gap-2">
            {availableSectionTypes.length > 0 && (
             <select 
               onChange={(e) => {
                 if (e.target.value) {
                   // Add new section
                   const newId = Math.max(...sections.map(s => s.id), 0) + 1;
                   setSections([...sections, { id: newId, title: e.target.value }]);
                 }
               }}
               className="select select-bordered select-sm"
               title="Select module to add"
             >
               <option value="">Add Module</option>
               {availableSectionTypes.map(type => (
                 <option key={type} value={type}>{type}</option>
               ))}
             </select>
           )}
         </div>
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
