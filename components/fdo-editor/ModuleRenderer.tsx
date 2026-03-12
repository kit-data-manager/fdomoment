import React from 'react';
import CoreAttributes, { CoreAttributesModuleData } from '../CoreAttributes';
import DigitalObjectAttributes, { DigitalObjectModuleData } from '../DigitalObjectAttributes';
import SoftwareAttributes, { SoftwareModuleData } from '../SoftwareAttributes';
import TypedPropertiesSection, { TypedAttributesModuleData } from '@/components/TypedAttributes/index';
import AdditionalAttributes from '../AdditionalAttributes';
import { ModuleDataType } from './types';

interface ModuleRendererProps {
  title: string;
  id: number;
  showHelp: boolean;
  onDataChange: (data: ModuleDataType) => void;
}

const ModuleRenderer = ({ title, id, showHelp, onDataChange }: ModuleRendererProps) => {
  switch (title) {
    case 'Core Attributes':
      return <CoreAttributes onDataChange={(data) => onDataChange(data as CoreAttributesModuleData)} showHelp={showHelp} />;
    case 'Digital Object Attributes':
      return <DigitalObjectAttributes onDataChange={(data) => onDataChange(data as DigitalObjectModuleData)} showHelp={showHelp} />;
    case 'Typed Properties':
      return <TypedPropertiesSection onDataChange={(data) => onDataChange(data as TypedAttributesModuleData)} showHelp={showHelp} />;
    case 'Additional Properties':
      return <AdditionalAttributes onDataChange={(data) => onDataChange(data as ModuleDataType)} showHelp={showHelp} />;
    case 'Software Attributes':
      return <SoftwareAttributes onDataChange={(data) => onDataChange(data as SoftwareModuleData)} showHelp={showHelp} />;
    default:
      return null;
  }
};

export default ModuleRenderer;
