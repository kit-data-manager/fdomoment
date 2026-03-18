import {CoreAttributesModuleData} from "@/components/CoreAttributes/types";
import {DataObjectModuleData} from "@/components/DataObjectAttributes/types";
import {SoftwareModuleData} from "@/components";
import {TypedAttributesModuleData} from "@/components/TypedAttributes";
import {AdditionalAttributeModuleData} from "@/components/AdditionalAttributes/types";
import {PublicationAttributesModuleData} from "@/components/PublicationAttributes/types";

export type ModuleDataType = CoreAttributesModuleData | DataObjectModuleData | SoftwareModuleData | TypedAttributesModuleData | AdditionalAttributeModuleData | PublicationAttributesModuleData;

export interface ModuleType {
  id: number;
  title: string;
}

export const MODULE_MAP: Record<string, string> = {
    'Core Attributes': 'coreAttributes',
    'Data Object Attributes': 'dataObjectAttributes',
    'Software Attributes': 'softwareAttributes',
    'Additional Attributes': 'additionalAttributes',
    'Typed Attributes': 'typedAttributes',
    'Publication Attributes': 'publicationAttributes'
};
