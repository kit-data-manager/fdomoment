import {MODULE_MAP, ModuleDataType, ModuleType} from "@/components/fdo-editor/types";
import {CoreAttributesModuleData} from "@/components/CoreAttributes/types";
import {TypedAttributesModuleData} from "@/components/TypedAttributes/types";
import {createRecordData, RecordData} from "@/utils/recordBuilder";
import {AdditionalAttributeModuleData} from "@/components/AdditionalAttributes/types";
import {DataObjectModuleData} from "@/components/DataObjectAttributes/types";
import {getSPDXLicenses, SPDXLicense} from "@/utils/license-client";
import {SoftwareModuleData} from "@/components";
import {PublicationAttributesModuleData} from "@/components/PublicationAttributes/types";

export type ValidationResponse = {
    errors: string[];
    validData:Record<string, ModuleDataType>;
}

/**
 * Collect all module data from localStorage and return it as record.
 */
const collectData = (
    modules: ModuleType[],
    modulesData: Record<string, ModuleDataType>
) => {
    const collectedData: Record<string, ModuleDataType> = {};

    // Collect data from all modules (from state or localStorage)
    modules.forEach((module: { id: number, title: string }) => {
        let data = modulesData[module.title];

        if (!data && typeof window !== 'undefined') {
            const storageKey = MODULE_MAP[module.title];
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                try {
                    data = JSON.parse(stored);
                    console.log(`[Validator] Loaded ${module.title} from ${storageKey}:`, data);
                } catch (e) {
                    console.error('Error parsing stored data for', module.title, e);
                }
            } else {
                console.log(`[Validator] No data found for ${module.title}`);
            }
        }

        if (data) {
            collectedData[module.title] = data;
        }
    });
    return collectedData;
}

/**
 * Check if all required properties of a certain module are set. If not, add an error.
 */
const checkPropertySet = (
    moduleName: string,
    data: any,
    keys: string[],
    errors: string[]
) => {
    console.log(`[Validator] Checking ${moduleName}:`, data);
    if(!data){
        errors.push(`${moduleName}: No data provided`);
    }else {
        keys.forEach(key => {
            if (!data[key] || data[key]?.toString().trim() === '') {
                errors.push(`${moduleName}: Attribute ${key} is required.`);
            }
        })
    }
}

/**
 * Validate the module data of all modules. Therefor, collect all data and validated them one by one, either by using
 * checkPropertySet or with a custom validation, i.e., for array-based modules.
 */
export const validateModulesData = (
    modules: ModuleType[],
    modulesData: Record<string, ModuleDataType>):ValidationResponse => {

    const visibleData: Record<string, ModuleDataType> = collectData(modules, modulesData);
    const errors: string[] = [];

    // Validate Core Attributes
    checkPropertySet('Core Attributes', visibleData['Core Attributes'], ['owner_id', 'research_field'], errors);

    // Validate Data Object Attributes or Software Attributes (they are exclusive)
    const dataObjectData = visibleData['Data Object Attributes'];
    const softwareData = visibleData['Software Attributes'];

    if(dataObjectData){
        checkPropertySet('Data Object Attributes', dataObjectData, ['mimeType', 'dataObjectLocation', 'license_id'], errors);
    }else if(softwareData){
        checkPropertySet('Software Attributes', softwareData, ['repositoryType', 'softwareLocation', 'readmeLocation', 'license_id'], errors);
    }

    // Validate Typed Attributes
    const typedAttributesData = visibleData['Typed Attributes'] as any;
    if (typedAttributesData) {
        const typedProps = typedAttributesData.properties || (Array.isArray(typedAttributesData) ? typedAttributesData : []);

        if (!typedProps || typedProps.length === 0) {
            errors.push('Typed Attributes: At least one typed attribute is required');
        } else {
            typedProps.forEach((prop: any, index: number) => {
                if (prop.typeId === '0.SIMPLE/UNESCO_THESAURUS_CONCEPT') {
                    if (!prop.value || !prop.value.uri || prop.value.uri.trim() === '') {
                        errors.push(`Typed Attributes: UNESCO Thesaurus Concept at index ${index} is missing URI`);
                    }
                }
                if (prop.typeId === '0.SIMPLE/RELATED_IDENTIFIER') {
                    if (!prop.value || !prop.value.relatedIdentifier || prop.value.relatedIdentifier.trim() === '') {
                        errors.push(`Typed Attributes: Related Identifier at index ${index} is missing identifier`);
                    }
                }
                if (prop.typeId === '0.SIMPLE/GEO_LOCATION') {
                    if (!prop.value || Object.keys(prop.value).length === 0) {
                        errors.push(`Typed Attributes: GeoLocation at index ${index} has no data`);
                    }
                }
            });
        }
    }

    // Validate Publication Attributes
    const publicationData = visibleData['Publication Attributes'];
    if (publicationData) {
        checkPropertySet('Publication Attributes', publicationData, ['doi', 'publicationType', 'title', 'publicationYear'], errors);
    }

    return {errors:errors, validData: errors.length > 0 ? null : visibleData } as ValidationResponse;
}

/**
 * Finalize all modules data, i.e., remove all irrelevant attributes and prepare the module data for being stored as FDO.
 * Transforms module data into RecordData structure with pid and record array.
 */
export const finalizeModulesData = (modulesData: Record<string, ModuleDataType>, pid: string = '') => {
    const recordData = createRecordData(pid || '');

    for (const key of Object.keys(modulesData)) {
        if(key === "Core Attributes") {
            const moduleData: CoreAttributesModuleData = modulesData[key] as CoreAttributesModuleData;

            if(moduleData.owner_id_type === "ROR"){
                recordData.record.push({ key: '0.SIMPLE/OWNER', value: moduleData.owner_id as string });
            }else{
                recordData.record.push({ key: '0.SIMPLE/OWNER', value: `https://orcid.org/${moduleData.owner_id as string}`});
            }

            recordData.record.push({ key: '0.SIMPLE/HELMHOLTZ_RESEARCH_FIELD', value: moduleData.research_field as string });
            recordData.record.push({key: "0.SIMPLE/PROFILE", value:"0.SIMPLE/CORE"});
        }

        if(key === "Data Object Attributes") {
            const moduleData: DataObjectModuleData = modulesData[key] as DataObjectModuleData;
            const allLicenses = getSPDXLicenses();
            const license:SPDXLicense | undefined = allLicenses.find((value) => {
                return value.id === moduleData.license_id
            });

            recordData.record.push({ key: '0.SIMPLE/DATA_OBJECT_LOCATION', value: moduleData.dataObjectLocation as string});
            recordData.record.push({ key: '0.SIMPLE/MIME_TYPE', value: moduleData.mimeType as string});
            recordData.record.push({ key: '0.SIMPLE/DATA_OBJECT_LICENSE', value: license?.url || moduleData.license_id as string});
            recordData.record.push({key: "0.SIMPLE/PROFILE", value:"0.SIMPLE/DATA_OBJECT"});
        }

        if(key === "Software Attributes") {
            const moduleData: SoftwareModuleData = modulesData[key] as SoftwareModuleData;
            const allLicenses = getSPDXLicenses();
            const license:SPDXLicense | undefined = allLicenses.find((value) => {
                return value.id === moduleData.license_id
            });

            recordData.record.push({ key: '0.SIMPLE/SOFTWARE_REPOSITORY_TYPE', value: moduleData.repositoryType as string});
            recordData.record.push({ key: '0.SIMPLE/SOFTWARE_LOCATION', value: moduleData.softwareLocation as string});
            recordData.record.push({ key: '0.SIMPLE/README_LOCATION', value: moduleData.readmeLocation as string});
            recordData.record.push({ key: '0.SIMPLE/SOFTWARE_LICENSE', value: license?.url || moduleData.license_id as string});
            recordData.record.push({key: "0.SIMPLE/PROFILE", value:"0.SIMPLE/SOFTWARE"});
        }

        if(key === "Typed Attributes") {
            const moduleData: TypedAttributesModuleData = modulesData[key] as unknown as TypedAttributesModuleData;

            // Add each typed property as a record entry
            if (moduleData.properties) {
                moduleData.properties.forEach((prop) => {
                    if (prop.typeId === '0.SIMPLE/UNESCO_THESAURUS_CONCEPT') {
                        recordData.record.push({
                            key: prop.typeId,
                            value: JSON.stringify(prop.value.uri)
                        });
                    }else{
                        recordData.record.push({
                            key: prop.typeId,
                            value: JSON.stringify(prop.value)
                        });
                    }
                });
            }
        }

        if(key === "Additional Attributes") {
            const moduleData: AdditionalAttributeModuleData = modulesData[key] as unknown as AdditionalAttributeModuleData;

            // Add each additional attribute as a record entry
            if (moduleData.rows) {
                moduleData.rows.forEach((prop) => {
                    recordData.record.push({
                        key: prop.key,
                        value: prop.value
                    });
                });
            }
        }

        if(key === "Publication Attributes") {
            const moduleData: PublicationAttributesModuleData = modulesData[key] as unknown as PublicationAttributesModuleData;

            if (moduleData.doi) {
                recordData.record.push({ key: 'doi', value: moduleData.doi as string });
            }
            if (moduleData.publicationType) {
                recordData.record.push({ key: 'publicationType', value: moduleData.publicationType as string });
            }
            if (moduleData.title) {
                recordData.record.push({ key: 'title', value: moduleData.title as string });
            }
            if (moduleData.publicationYear) {
                recordData.record.push({ key: 'publicationYear', value: moduleData.publicationYear as string });
            }
            if (moduleData.creators && moduleData.creators.length > 0) {
                recordData.record.push({ key: 'creators', value: JSON.stringify(moduleData.creators) });
            }
        }
    }

    return recordData;
}
