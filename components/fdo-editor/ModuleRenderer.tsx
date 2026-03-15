import React from 'react';
import CoreAttributes from '@/components/CoreAttributes';
import TypedPropertiesSection, { TypedAttributesModuleData } from '@/components/TypedAttributes/index';
import { ModuleDataType } from './types';
import {AdditionalAttributes} from "@/components/AdditionalAttributes";
import {SoftwareAttributes, SoftwareModuleData} from "@/components/SoftwareAttributes";
import {DigitalObjectAttributes} from "@/components/DigitalObjectAttributes";
import {CoreAttributesModuleData} from "@/components/CoreAttributes/types";
import {DigitalObjectModuleData} from "@/components/DigitalObjectAttributes/types";

interface ModuleRendererProps {
  title: string;
  showHelp: boolean;
  onDataChange: (data: ModuleDataType) => void;
}

const ModuleRenderer = ({ title, showHelp, onDataChange }: ModuleRendererProps) => {
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
