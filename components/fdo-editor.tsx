"use client";
import React, { useState, useRef } from 'react';
import BasicSection from './BasicSection';
import DatasetSection from './DatasetSection';
import AdditionalSection from './AdditionalSection';
import { Icon } from '@iconify/react';
import TypedPropertiesSection from "@/components/TypedPropertiesSection";
import { AppSidebar } from './app-sidebar';

type SectionRef = {
  save: () => void;
};

export function EditorWithSidebar() {
  const [sections, setSections] = useState([
    { id: 1, title: 'Basic Properties' }
  ]);
  
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  
  const [openSectionId, setOpenSectionId] = useState<number>(1);
  
  const sectionRefs = useRef<Record<number, React.RefObject<SectionRef>>>({});
  
  const availableSectionTypes = ['Basic Properties', 'Dataset Properties', 'Typed Properties', 'Additional Properties'].filter(
    type => !sections.some(section => section.title === type)
  );

  const handleRemoveSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const handleSaveSection = (id: number) => {
    const ref = sectionRefs.current[id];
    if (ref?.current) {
      ref.current.save();
    }
  };

  const updateSectionData = (sectionTitle: string, data: any) => {
      setSectionData(prev => ({
      ...prev,
      [sectionTitle]: data
    }));
  };

  const collectData = () => {
    const visibleData: Record<string, any> = {};
    sections.forEach(section => {
      if (sectionData[section.title]) {
        visibleData[section.title] = sectionData[section.title];
      }
    });
    return visibleData;
  };

  const addSection = (title: string) => {
    const newId = Math.max(...sections.map(s => s.id), 0) + 1;
    setSections([...sections, { id: newId, title }]);
  };

  const renderSectionContent = (title: string, id: number) => {
    const ref = (sectionRefs.current[id] = sectionRefs.current[id] || React.createRef<SectionRef>());
    
    switch (title) {
      case 'Basic Properties':
        return <BasicSection ref={ref} onDataChange={(data) => updateSectionData('Basic Properties', data)} />;
      case 'Dataset Properties':
        return <DatasetSection ref={ref} onDataChange={(data) => updateSectionData('Dataset Properties', data)} />;
      case 'Typed Properties':
        return <TypedPropertiesSection onTypeSelected={(data) => updateSectionData('Typed Properties', data)} />;
      case 'Additional Properties':
        return <AdditionalSection onDataChange={(data) => updateSectionData('Additional Properties', data)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full">
      <AppSidebar 
        availableSectionTypes={availableSectionTypes}
        onAddSection={addSection}
        onCollectData={() => console.debug(JSON.stringify(collectData(), null, 4))}
      />
      <main className="flex-1 p-6">
        <div className="p-4 rounded-lg shadow-md">
          <div className="join join-vertical w-full">
            {sections.map((section) => (
              <div key={section.id} className="collapse join-item border mb-2 relative">
                <input 
                  type="radio" 
                  name="accordion" 
                  defaultChecked={section.title === 'Basic Properties'}
                  onChange={() => {
                    setOpenSectionId(section.id);
                  }}
                />
                <div className="collapse-title flex justify-between items-center pr-2">
                  <label className="text-lg font-semibold cursor-pointer">{section.title}</label>
                </div>
                <div className="absolute right-4 top-4 z-20 flex gap-1">
                  <button
                      onClick={() => handleSaveSection(section.id)}
                      className="btn btn-link btn-primary btn-xs"
                      title="Save module"
                  >
                      <Icon icon="mdi:content-save" width="20" height="20" />
                  </button>
                  {section.title !== 'Basic Properties' && (
                    <button
                      onClick={() => handleRemoveSection(section.id)}
                      className="btn btn-link btn-primary btn-xs"
                      title="Remove module"
                    >
                      <Icon icon="mdi:close" width="20" height="20" />
                    </button>
                  )}
                </div>
                <div className="collapse-content">
                  {renderSectionContent(section.title, section.id)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditorWithSidebar;
