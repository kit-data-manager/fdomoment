"use client";
import React, { useState, useRef } from 'react';
import BasicSection from './BasicSection';
import DatasetSection from './DatasetSection';
import AdditionalSection from './AdditionalSection';
import SoftwareSection from './SoftwareSection';
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

const sectionsWithSave = new Set(['Basic Properties', 'Dataset Properties', 'Software Properties']);

const allSectionTypes = ['Basic Properties', 'Dataset Properties', 'Software Properties', 'Typed Properties', 'Additional Properties'];

const exclusiveGroups = [
  { types: ['Dataset Properties', 'Software Properties'], icon: 'solar:link-round-angle-line-duotone' }
];

const getSectionStatus = (sections: { id: number; title: string }[]) => {
  const addedTypes = new Set(sections.map(s => s.title));
  
  const disabledReasons: Record<string, string> = {};
  
  for (const type of allSectionTypes) {
    if (addedTypes.has(type)) {
      disabledReasons[type] = 'added';
    }
  }
  
  for (const group of exclusiveGroups) {
    const presentInSections = group.types.filter(type => addedTypes.has(type));
    if (presentInSections.length > 0) {
      for (const type of group.types) {
        if (!addedTypes.has(type)) {
          disabledReasons[type] = `exclusive:${presentInSections[0]}`;
        }
      }
    }
  }

  return disabledReasons;
};

const getExclusiveInfo = (type: string) => {
  for (const group of exclusiveGroups) {
    if (group.types.includes(type)) {
      return group;
    }
  }
  return null;
};

const sectionStatus = getSectionStatus(sections);

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
    const hasSave = sectionsWithSave.has(title);
    const ref = hasSave ? (sectionRefs.current[id] = sectionRefs.current[id] || React.createRef<SectionRef>()) : null;
    
    switch (title) {
      case 'Basic Properties':
        return <BasicSection ref={ref!} onDataChange={(data) => updateSectionData('Basic Properties', data)} />;
      case 'Dataset Properties':
        return <DatasetSection ref={ref!} onDataChange={(data) => updateSectionData('Dataset Properties', data)} />;
      case 'Typed Properties':
        return <TypedPropertiesSection onTypeSelected={(data) => updateSectionData('Typed Properties', data)} />;
      case 'Additional Properties':
        return <AdditionalSection onDataChange={(data) => updateSectionData('Additional Properties', data)} />;
      case 'Software Properties':
        return <SoftwareSection onDataChange={(data) => updateSectionData('Software Properties', data)} />;
      default:
        return null;
    }
  };

  const hasSaveSupport = (title: string) => sectionsWithSave.has(title);

  return (
    <div className="flex h-screen w-full">
      <AppSidebar 
        allSectionTypes={allSectionTypes}
        sectionStatus={sectionStatus}
        getExclusiveInfo={getExclusiveInfo}
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
                    {hasSaveSupport(section.title) && (
                    <button
                      onClick={() => handleSaveSection(section.id)}
                      className="btn btn-link btn-primary btn-xs"
                      title="Save module"
                    >
                      <Icon icon="mdi:content-save" width="20" height="20" />
                    </button>
                  )}
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
