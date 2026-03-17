'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { FdoEditor } from '@/components/fdo-editor';
import { Footer } from '@/components/Footer';
import { getExclusiveInfo } from '@/lib/module-info';

export default function Editor() {
  const [moduleStatus, setModuleStatus] = useState<Record<string, string>>({});

  const allModuleTypes = [
    'Core Attributes',
    'Digital Object Attributes',
    'Software Attributes',
    'Typed Properties',
    'Additional Properties'
  ];

  const handleAddModule = (type: string) => {
    setModuleStatus(prev => ({ ...prev, [type]: type }));
  };

  const handleRemoveModule = (type: string) => {
    setModuleStatus(prev => {
      const { [type]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleCollectData = () => {
    console.log('Collecting data...');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex overflow-hidden">
        <AppSidebar
          allModuleTypes={allModuleTypes}
          moduleStatus={moduleStatus}
          getExclusiveInfo={getExclusiveInfo}
          onAddModule={handleAddModule}
          onCollectData={handleCollectData}
        />
        <div className="flex-1 overflow-auto">
          <FdoEditor
            moduleTypes={allModuleTypes}
            moduleStatus={moduleStatus}
            onModuleStatusChange={handleRemoveModule}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
