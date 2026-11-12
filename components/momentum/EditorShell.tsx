'use client';

import React, {useState} from 'react';
import {
    Creator,
    DataObjectMetadata,
    EditorState, MiscEntry,
    MiscMetadata,
    PublicationMetadata,
    SoftwareMetadata
} from '@/lib/momentum/types';
import {FDO_PROFILES, FDO_TYPES} from '@/lib/fdo/identifiers';
import {useKeycloak} from '@/context/KeycloakContext';
import {EditorNavigator} from '@/components/momentum/Navigator/EditorNavigator';
import {CoreModule} from '@/components/momentum/CoreModule';
import {FairScoreBar} from '@/components/momentum/FairScoreBar';
import {TemplateSelection} from "@/components/momentum/TemplateSelection";
import {DataObjectModule} from "@/components/momentum/DataObjectModule";
import {SoftwareModule} from "@/components/momentum/SoftwareModule";
import {PublicationModule} from "./PublicationModule";
import {AdditionalAttributesModule} from "@/components/momentum/AdditionalAttributesModule";
import {GenericModule} from "@/components/momentum/GenericModule";
import {addRecordEntry, createRecordData, RecordData} from "@/utils/recordBuilder";
import {FdoCreatedDialog} from '@/components/momentum/FdoCreatedDialog';
import {createFdoRecord, upsertFairScoreAggregation} from '@/lib/database/actions';
import {calculateFairScore} from '@/lib/momentum/fairScore';
import {getLicenseById} from "@/lib/momentum/constants";
import {
    getModuleConfig,
    getStepOrder,
    getTemplateModuleIds,
    isCoreModule,
    collectConfigRecordEntries,
} from "@/lib/momentum/registry";


interface EditorShellProps {
    state: EditorState;
    updateBasis: (partial: Partial<any>) => void;
    updateDataset: (partial: Partial<any>) => void;
    updateSoftware: (partial: Partial<any>) => void;
    updatePublication: (partial: Partial<any>) => void;
    updateMisc: (entries: any[]) => void;
    updateConfigModule?: (moduleId: string, propertyId: string, partial: any) => void;
    setTemplate: (type: EditorState['template'], enabledModules?: string[]) => void;
    setActiveModule: (module: string) => void;
    canCreate: boolean;
    resetState?: () => void;
    onNextModule?: () => void;
    onPrevModule?: () => void;
}

export function EditorShell(props: EditorShellProps) {
    const {
        state,
        updateBasis,
        updateDataset,
        updateSoftware,
        updatePublication,
        updateMisc,
        updateConfigModule,
        setTemplate,
        setActiveModule,
        canCreate,
        resetState,
    } = props;

    const {userName} = useKeycloak();
    const [createdPid, setCreatedPid] = useState<string | null>(null);

    const handleCreate = async () => {
        //collect core attributes
        const orcid = state['core'].orcid;
        const researchDomain = state['core'].researchDomain?.label || '';

        let fdoRecord: RecordData = createRecordData();

        //add core attributes manually
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.OWNER, orcid);
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.HELMHOLTZ_RESEARCH_FIELD, researchDomain);
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.PROFILE, FDO_PROFILES.CORE);

        //collect other attributes only if module is enabled
        state['enabledModules'].filter((module) => module != 'core').forEach(module => {
            const cfgModule = getModuleConfig(module);

            // Every used module contributes its profile (0.SIMPLE/PROFILE) to the
            // created FAIR Digital Object.
            if (cfgModule?.profile) {
                fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.PROFILE, cfgModule.profile);
            }

            if (cfgModule && cfgModule.kind === 'generic') {
                // Declarative module: fold each configured property into the record.
                collectConfigRecordEntries(module, {
                    properties: state.configModules[module] ?? {},
                }, (key, value) => {
                    fdoRecord = addRecordEntry(fdoRecord, key, value);
                });
                return;
            }
            switch (module) {
                case "software":
                    fdoRecord = collectSoftwareAttributes(state['software'], fdoRecord);
                    break;
                case "dataobject":
                    fdoRecord = collectDataObjectAttributes(state['dataobject'], fdoRecord);
                    break;
                case "publication":
                    fdoRecord = collectPublicationAttributes(state['publication'], fdoRecord);
                    break;
                case "additional":
                    fdoRecord = collectMiscAttributes(state['misc'], fdoRecord);
                    break;
                default:
                    console.log("Unknown/unhandled module: ", module);
            }
        })

        //collect fair score for stats
        const score = calculateFairScore(state);

        //create FDO using configured fdo service
        try {
            const response: Response = await fetch('/api/fdoservice', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(fdoRecord),
            });

            if (!response.ok) {
                throw new Error('Failed to create FDO via service');
            }

            const createdFdo = await response.json();
            fdoRecord.pid = createdFdo.pid;

            //persist fdo record including PID
            try {
                await createFdoRecord({
                    pid: createdFdo.pid,
                    userName: userName || '',
                    orcid: orcid || '',
                    researchDomain: researchDomain,
                    fairScore: score.total,
                });

                //store single FAIR criteria scores
                for (const [criterium, value] of Object.entries(score)) {
                    if (criterium !== 'total') {
                        await upsertFairScoreAggregation(userName || '', criterium as 'findable' | 'accessible' | 'interoperable' | 'reusable', value as number);
                    }
                }
            } catch (dbError) {
                console.error('Failed to store FDO in database:', dbError);
            }

            setCreatedPid(fdoRecord.pid);
        } catch (error) {
            console.error('Failed to store FDO record:', error);
        }
    };

    const handleStartOver = () => {
        setCreatedPid(null);
        resetState?.();
    };

    const collectSoftwareAttributes = (metadata: SoftwareMetadata, fdoRecord: RecordData): RecordData => {
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.SOFTWARE_REPOSITORY_TYPE, metadata.repositoryType);
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.SOFTWARE_LOCATION, metadata.repositoryUrl);
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.SOFTWARE_LICENSE, getLicenseById(metadata.license));
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.README_LOCATION, metadata.readmeUrl);
        return fdoRecord;
    }

    const collectDataObjectAttributes = (metadata: DataObjectMetadata, fdoRecord: RecordData): RecordData => {
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.DATA_OBJECT_LOCATION, metadata.dataUrl);
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.DATA_OBJECT_LICENSE, getLicenseById(metadata.license));
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.MIME_TYPE, metadata.mimeType);
        return fdoRecord;
    }

    const collectPublicationAttributes = (metadata: PublicationMetadata, fdoRecord: RecordData): RecordData => {
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.DOI, metadata.doi);
        fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.PUBLICATION_TITLE, metadata.title);

        metadata.creators.forEach((creator: Creator) => {
            const creatorValue = creator.orcid || creator.name || creator.id;
            fdoRecord = addRecordEntry(fdoRecord, FDO_TYPES.PUBLICATION_CREATOR, creatorValue);
        })
        return fdoRecord;
    }

    const collectMiscAttributes = (metadata: MiscMetadata | null, fdoRecord: RecordData): RecordData => {
        if (!metadata) return fdoRecord;
        metadata.entries.forEach((entry: MiscEntry) => {
            fdoRecord = addRecordEntry(fdoRecord, entry.key, entry.value);
        })
        return fdoRecord;
    }

    const getStepModules = (): string[] => {
        if (state.template) {
            return getStepOrder(state.template);
        }
        return getTemplateModuleIds('dataobject');
    };

    const handleCoreNext = () => {
        // Move to the first enabled module after core in the template's step order.
        const steps = getStepModules();
        const startIndex = steps.indexOf('core');
        for (let i = startIndex + 1; i < steps.length; i++) {
            if (state.enabledModules.includes(steps[i])) {
                setActiveModule(steps[i]);
                break;
            }
        }
    };

    const handleNextModule = () => {
        const steps = getStepModules();
        const currentIndex = steps.indexOf(state.activeModule);
        for (let i = currentIndex + 1; i < steps.length; i++) {
            if (state.enabledModules.includes(steps[i])) {
                setActiveModule(steps[i]);
                break;
            }
        }
    };

    const handlePrevModule = () => {
        const steps = getStepModules();
        const currentIndex = steps.indexOf(state.activeModule);
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (state.enabledModules.includes(steps[i]) || isCoreModule(steps[i])) {
                setActiveModule(steps[i]);
                break;
            }
        }
    };

    const handleTemplateSelect = (templateId: string, enabledModules: string[]) => {
        setTemplate(templateId as any, enabledModules);
        setActiveModule('core');
    };

    //check if template is selected, otherwise template selection is rendered
    const isTemplateSelection = state.template !== null;

    const hasEnabledModuleAfter = (moduleId: string): boolean => {
        const steps = getStepModules();
        const idx = steps.indexOf(moduleId);
        if (idx === -1) return false;
        for (let i = idx + 1; i < steps.length; i++) {
            if (state.enabledModules.includes(steps[i])) return true;
        }
        return false;
    };

    const renderActiveModule = () => {
        const cfgModule = getModuleConfig(state.activeModule);
        if (cfgModule && cfgModule.kind === 'generic') {
            // Fully declarative module - render via GenericModule.
            if (!updateConfigModule) return null;
            return (
                <GenericModule
                    config={cfgModule}
                    properties={state.configModules[state.activeModule] ?? {}}
                    onPropertyChange={(propertyId, value) =>
                        updateConfigModule(state.activeModule, propertyId, value)
                    }
                    showNext={hasEnabledModuleAfter(state.activeModule)}
                    showPrev={true}
                    onNextModule={handleNextModule}
                    onPrevModule={handlePrevModule}
                />
            );
        }

        switch (state.activeModule) {
            case 'core':
                return (
                    <CoreModule
                        basis={state.core}
                        updateCore={updateBasis}
                        onNext={handleCoreNext}
                        showNext={true}
                        showPrev={false}
                        onNextModule={handleNextModule}
                        onPrevModule={handlePrevModule}
                    />
                );

            case 'template-select':
                return (
                    <TemplateSelection
                        onSelectTemplate={handleTemplateSelect}
                    />
                );

            case 'dataobject':
                return (
                    <DataObjectModule
                        dataobject={state.dataobject}
                        core={state.core}
                        updateDataobject={updateDataset}
                        showNext={hasEnabledModuleAfter('dataobject')}
                        showPrev={true}
                        onNextModule={handleNextModule}
                        onPrevModule={handlePrevModule}
                    />
                );

            case 'software':
                return (
                    <SoftwareModule
                        software={state.software}
                        updateSoftware={updateSoftware}
                        showNext={hasEnabledModuleAfter('software')}
                        showPrev={true}
                        onNextModule={handleNextModule}
                        onPrevModule={handlePrevModule}
                    />
                );

            case 'publication':
                return (
                    <PublicationModule
                        publication={state.publication}
                        updatePublication={updatePublication}
                        showNext={hasEnabledModuleAfter('publication')}
                        showPrev={true}
                        onNextModule={handleNextModule}
                        onPrevModule={handlePrevModule}
                    />
                );

            case 'additional':
                if (!state.misc) return null;
                return (
                    <AdditionalAttributesModule
                        misc={state.misc}
                        researchDomain={state.core.researchDomain}
                        updateMisc={updateMisc}
                        showNext={hasEnabledModuleAfter(state.activeModule)}
                        showPrev={true}
                        onNextModule={handleNextModule}
                        onPrevModule={handlePrevModule}
                    />
                );

            default:
                return null;
        }
    };

    if (!isTemplateSelection) {
        //render template selection
        return (
            <>
                {renderActiveModule()}
                <FdoCreatedDialog
                    isOpen={createdPid !== null}
                    pid={createdPid || ''}
                    onStartOver={handleStartOver}
                />
            </>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <EditorNavigator
                state={state}
                moduleStatus={state.moduleStatus}
                setActiveModule={setActiveModule}
             >
                <main className="flex-1 overflow-y-auto bg-base-200">
                    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8">
                        <div className="flex-1 max-w-2xl">
                            {renderActiveModule()}
                        </div>
                        <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-4">
                            <FairScoreBar
                                state={state}
                                setActiveModule={setActiveModule}
                            />
                            <div className="p-4 bg-base-100 rounded-lg shadow-sm">
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={!canCreate}
                                    className={`btn btn-primary w-full text-lg py-6 ${
                                        !canCreate ? 'btn-disabled' : ''
                                    }`}
                                >
                                    Create FDO ✨
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </EditorNavigator>
            <FdoCreatedDialog
                isOpen={createdPid !== null}
                pid={createdPid || ''}
                onStartOver={handleStartOver}
            />
        </div>
    );
}
