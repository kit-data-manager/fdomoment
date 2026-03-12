import {ModuleDataType, ModuleType} from "@/components/fdo-editor/types";

export type ValidationResponse = {
    errors: string[];
    validData:Record<string, ModuleDataType>;
}

const collectData = (
    modules: ModuleType[],
    modulesData: Record<string, ModuleDataType>
) => {
    const collectedData: Record<string, ModuleDataType> = {};

    // Collect data from all modules (from state or localStorage)
    modules.forEach((module: { id: number, title: string }) => {
        let data = modulesData[module.title];

        // If not in state, try localStorage
        if (!data && typeof window !== 'undefined') {
            const storageKey = module.title.replace(' ', '').toLowerCase();
            const stored = localStorage.getItem(`${storageKey}Data`);
            if (stored) {
                try {
                    data = JSON.parse(stored);
                } catch (e) {
                    console.error('Error parsing stored data for', module.title, e);
                }
            }
        }

        // Special handling for Core Attributes
        if (module.title === 'Core Attributes' && !data && typeof window !== 'undefined') {
            const coreStored = localStorage.getItem('coreAttributesInputs');
            if (coreStored) {
                try {
                    data = JSON.parse(coreStored);
                } catch (e) {
                    console.error('Error parsing core attributes', e);
                }
            }
        }

        // Special handling for Digital Object Attributes
        if (module.title === 'Digital Object Attributes' && !data && typeof window !== 'undefined') {
            const digitalObjectStored = localStorage.getItem('digitalObjectAttributesInputs');
            if (digitalObjectStored) {
                try {
                    data = JSON.parse(digitalObjectStored);
                } catch (e) {
                    console.error('Error parsing digital object attributes', e);
                }
            }
        }

        // Special handling for Software Attributes
        if (module.title === 'Software Attributes' && !data && typeof window !== 'undefined') {
            const softwareStored = localStorage.getItem('softwareAttributesInputs');
            if (softwareStored) {
                try {
                    data = JSON.parse(softwareStored);
                } catch (e) {
                    console.error('Error parsing software attributes', e);
                }
            }
        }

        // Special handling for Additional Properties
        if (module.title === 'Additional Properties' && !data && typeof window !== 'undefined') {
            const additionalStored = localStorage.getItem('additionalAttributesRows');
            if (additionalStored) {
                try {
                    data = additionalStored as any;
                } catch (e) {
                    console.error('Error parsing additional attributes', e);
                }
            }
        }

        // Special handling for Typed Properties
        if (module.title === 'Typed Properties' && !data && typeof window !== 'undefined') {
            const typedStored = localStorage.getItem('typedProperties');
            if (typedStored) {
                try {
                    const parsed = JSON.parse(typedStored);
                    // Wrap in object structure if it's an array (backward compatibility)
                    data = Array.isArray(parsed) ? { properties: parsed } : parsed;
                } catch (e) {
                    console.error('Error parsing typed properties', e);
                }
            }
        }

        if (data) {
            collectedData[module.title] = data;
        }
    });
    return collectedData;
}

const checkPropertySet = (
    moduleName: string,
    data: any,
    keys: string[],
    errors: string[]
) => {
    if(!data){
        errors.push(`${moduleName}: No data provided`);
    }else {
        keys.forEach(key => {
            if (!data[key] || data[key].trim() === '') {
                errors.push(`${moduleName}: Attribute ${key} is required.`);
            }
        })
    }
}


export const validateModulesData = (
    modules: ModuleType[],
    modulesData: Record<string, ModuleDataType>):ValidationResponse => {

    const visibleData: Record<string, ModuleDataType> = collectData(modules, modulesData);
    const errors: string[] = [];

    // Validate Core Attributes
    checkPropertySet('Core Attributes', visibleData['Core Attributes'], ['owner_id', 'research_field'], errors);

    // Validate Digital Object Attributes or Software Attributes (they are exclusive)
    const digitalObjectData = visibleData['Digital Object Attributes'];
    const softwareData = visibleData['Software Attributes'];

    if(digitalObjectData){
        checkPropertySet('Digital Object Attributes', digitalObjectData, ['mimeType', 'contentLocation', 'license_id'], errors);
    }else if(softwareData){
        checkPropertySet('Software Attributes', softwareData, ['repositoryType', 'softwareLocation', 'readmeLocation', 'license_id'], errors);
    }

    // Validate Typed Properties
    const typedPropertiesData = visibleData['Typed Properties'] as any;
    if (typedPropertiesData) {
        // Data structure is { properties: TypedPropertyItem[] }
        const typedProps = typedPropertiesData.properties || (Array.isArray(typedPropertiesData) ? typedPropertiesData : []);

        if (!typedProps || typedProps.length === 0) {
            errors.push('Typed Properties: At least one typed property is required');
        } else {
            typedProps.forEach((prop: any, index: number) => {
                console.log("PROP ", prop);
                if (prop.typeId === '0.SIMPLE/UNESCO_THESAURUS_CONCEPT') {
                    if (!prop.value || !prop.value.uri || prop.value.uri.trim() === '') {
                        errors.push(`Typed Properties: UNESCO Thesaurus Concept at index ${index} is missing URI`);
                    }
                }
                if (prop.typeId === '0.SIMPLE/RELATED_IDENTIFIER') {
                    if (!prop.value || !prop.value.relatedIdentifier || prop.value.relatedIdentifier.trim() === '') {
                        errors.push(`Typed Properties: Related Identifier at index ${index} is missing identifier`);
                    }
                }
                if (prop.typeId === 'https://w3id.org/astro/GeoLocation') {
                    if (!prop.value || Object.keys(prop.value).length === 0) {
                        errors.push(`Typed Properties: GeoLocation at index ${index} has no data`);
                    }
                }
            });
        }
    }

        return {errors:errors, validData: errors.length > 0 ? null : visibleData } as ValidationResponse;
}
