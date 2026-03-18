import React from 'react';
import CoreAttributes from '@/components/CoreAttributes';
import TypedAttributes, { TypedAttributesModuleData } from '@/components/TypedAttributes/index';
import { ModuleDataType } from './types';
import {AdditionalAttributes} from "@/components/AdditionalAttributes";
import SoftwareAttributes from "@/components/SoftwareAttributes";
import {DataObjectAttributes} from "@/components/DataObjectAttributes";
import {PublicationAttributes} from "@/components/PublicationAttributes";

interface ModuleRendererProps {
  title: string;
  showHelp: boolean;
}

const noop = (data: ModuleDataType) => {};

const ModuleRenderer = ({ title, showHelp }: ModuleRendererProps) => {
  switch (title) {
    case 'Core Attributes':
      return <CoreAttributes showHelp={showHelp} />;
    case 'Data Object Attributes':
      return <DataObjectAttributes showHelp={showHelp} />;
    case 'Typed Attributes':
      return <TypedAttributes onDataChange={noop} showHelp={showHelp} />;
    case 'Additional Attributes':
      return <AdditionalAttributes showHelp={showHelp} />;
    case 'Software Attributes':
      return <SoftwareAttributes showHelp={showHelp} />;
    case 'Publication Attributes':
      return <PublicationAttributes showHelp={showHelp} />;
    default:
      return null;
  }
};

export default ModuleRenderer;
