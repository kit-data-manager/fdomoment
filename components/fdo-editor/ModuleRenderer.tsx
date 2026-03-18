import React from 'react';
import CoreAttributes from '@/components/CoreAttributes';
import TypedAttributes, { TypedAttributesModuleData } from '@/components/TypedAttributes/index';
import { ModuleDataType } from './types';
import {AdditionalAttributes} from "@/components/AdditionalAttributes";
import SoftwareAttributes from "@/components/SoftwareAttributes";
import {DataObjectAttributes} from "@/components/DataObjectAttributes";

interface ModuleRendererProps {
  title: string;
  showHelp: boolean;
  onDataChange: (data: ModuleDataType) => void;
}

const ModuleRenderer = ({ title, showHelp, onDataChange }: ModuleRendererProps) => {
  switch (title) {
    case 'Core Attributes':
      return <CoreAttributes showHelp={showHelp} />;
    case 'Data Object Attributes':
      return <DataObjectAttributes showHelp={showHelp} />;
    case 'Typed Attributes':
      return <TypedAttributes onDataChange={(data) => onDataChange(data as TypedAttributesModuleData)} showHelp={showHelp} />;
    case 'Additional Attributes':
      return <AdditionalAttributes onDataChange={(data) => onDataChange(data as ModuleDataType)} showHelp={showHelp} />;
    case 'Software Attributes':
      return <SoftwareAttributes showHelp={showHelp} />;
    default:
      return null;
  }
};

export default ModuleRenderer;
