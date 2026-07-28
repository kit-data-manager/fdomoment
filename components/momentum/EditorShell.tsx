'use client';

import React, {useState} from 'react';
import {
    Creator,
    DataObjectMetadata,
    EditorState, MiscEntry,
    MiscMetadata,
    ModuleIdentifier,
    MODULE_ORDER,
    PublicationMetadata,
    SoftwareMetadata
} from '@/lib/momentum/types';
import {useKeycloak} from '@/context/KeycloakContext';
import {EditorNavigator} from '@/components/momentum/Navigator/EditorNavigator';
import {CoreModule} from '@/components/momentum/CoreModule';
import {FairScoreBar} from '@/components/momentum/FairScoreBar';
import {TemplateSelection} from "@/components/momentum/TemplateSelection";
import {DataObjectModule} from "@/components/momentum/DataObjectModule";
import {SoftwareModule} from "@/components/momentum/SoftwareModule";
import {PublicationModule} from "./PublicationModule";
import {AdditionalAttributesModule} from "@/components/momentum/AdditionalAttributesModule";
import {addRecordEntry, createRecordData, RecordData} from "@/utils/recordBuilder";
import {FdoCreatedDialog} from '@/components/momentum/FdoCreatedDialog';
import {createFdoRecord, upsertFairScoreAggregation} from '@/lib/database/actions';
import {calculateFairScore} from '@/lib/momentum/fairScore';
import {getLicenseById} from "@/lib/momentum/constants";


interface EditorShellProps {
    state: EditorState;
    updateBasis: (partial: Partial<any>) => void;
    updateDataset: (partial: Partial<any>) => void;
    updateSoftware: (partial: Partial<any>) => void;
    updatePublication: (partial: Partial<any>) => void;
    updateMisc: (entries: any[]) => void;
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
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/OWNER', orcid);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/HELMHOLTZ_RESEARCH_FIELD', researchDomain);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/PROFILE', '0.SIMPLE/CORE');

        //collect other attributes only if module is enabled
        state['enabledModules'].filter((module) => module != 'core').forEach(module => {
            switch (module as ModuleIdentifier) {
                case "software":
                    fdoRecord = collectSoftwareAttributes(state['software'], fdoRecord);
                    break;
                case "dataobject":
                    fdoRecord = collectDataObjectAttributes(state['dataobject'], fdoRecord);
                    break;
                case "publication":
                    fdoRecord = collectPublicationAttributes(state['publication'], fdoRecord);
                    break;
                case "misc":
                    fdoRecord = collectMiscAttributes(state['misc'], fdoRecord);
                    break;
                default:
                    console.log("Unknown/unhandled module: ", module);
            }
        })

        //collect fair score for stats
        const score = calculateFairScore(state);

        console.log("POST ", fdoRecord);

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
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/SOFTWARE_REPOSITORY_TYPE', metadata.repositoryType);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/SOFTWARE_LOCATION', metadata.repositoryUrl);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/SOFTWARE_LICENSE', getLicenseById(metadata.license));
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/README_LOCATION', metadata.readmeUrl);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/PROFILE', '0.SIMPLE/SOFTWARE');
        return fdoRecord;
    }

    const collectDataObjectAttributes = (metadata: DataObjectMetadata, fdoRecord: RecordData): RecordData => {
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/DATA_OBJECT_LOCATION', metadata.dataUrl);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/DATA_OBJECT_LICENSE', getLicenseById(metadata.license));
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/MIME_TYPE', metadata.mimeType);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/PROFILE', '0.SIMPLE/DATA_OBJECT');
        return fdoRecord;
    }

    const collectPublicationAttributes = (metadata: PublicationMetadata, fdoRecord: RecordData): RecordData => {
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/DOI', metadata.doi);
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/PUBLICATION_TITLE', metadata.title);

        metadata.creators.forEach((creator: Creator) => {
            const creatorValue = creator.orcid || creator.name || creator.id;
            fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/PUBLICATION_CREATOR', creatorValue);
        })
        fdoRecord = addRecordEntry(fdoRecord, '0.SIMPLE/PROFILE', '0.SIMPLE/PUBLICATION');
        return fdoRecord;
    }

    const collectMiscAttributes = (metadata: MiscMetadata | null, fdoRecord: RecordData): RecordData => {
        if (!metadata) return fdoRecord;
        metadata.entries.forEach((entry: MiscEntry) => {
            fdoRecord = addRecordEntry(fdoRecord, entry.key, entry.value);
        })
        return fdoRecord;
    }

    const getCurrentModuleIndex = () => {
        return MODULE_ORDER.indexOf(state.activeModule as ModuleIdentifier);
    };

    const handleCoreNext = () => {
        if (!state.template) {
            setActiveModule('template-select');
        } else if (state.template === 'dataobject') {
            setActiveModule('dataobject');
        } else if (state.template === 'software') {
            setActiveModule('software');
        } else if (state.template === 'publication') {
            setActiveModule('publication');
        }
    };

    const handleNextModule = () => {
        const currentIndex = getCurrentModuleIndex();
        // Find the next enabled module
        for (let i = currentIndex + 1; i < MODULE_ORDER.length; i++) {
            if (state.enabledModules.includes(MODULE_ORDER[i])) {
                setActiveModule(MODULE_ORDER[i]);
                break;
            }
        }
    };

    const handlePrevModule = () => {
        const currentIndex = getCurrentModuleIndex();
        // Find the previous enabled module
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (state.enabledModules.includes(MODULE_ORDER[i]) || MODULE_ORDER[i] === 'core') {
                setActiveModule(MODULE_ORDER[i]);
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

    const renderActiveModule = () => {
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
                        setActiveModule={setActiveModule as (module: string) => void}
                        showNext={state.enabledModules.some(m => ['software', 'publication', 'misc'].includes(m))}
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
                        setActiveModule={setActiveModule as (module: string) => void}
                        showNext={state.enabledModules.some(m => ['publication', 'misc'].includes(m))}
                        showPrev={true}
                        onNextModule={handleNextModule}
                        onPrevModule={handlePrevModule}
                    />
                );

            case 'publication':
                if (!state.publication) return null;
                return (
                    <PublicationModule
                        publication={state.publication}
                        updatePublication={updatePublication}
                        showNext={state.enabledModules.includes('misc')}
                        showPrev={true}
                        onNextModule={handleNextModule}
                        onPrevModule={handlePrevModule}
                    />
                );

            case 'misc':
                if (!state.misc) return null;
                return (
                    <AdditionalAttributesModule
                        misc={state.misc}
                        researchDomain={state.core.researchDomain}
                        updateMisc={updateMisc}
                        showNext={false}
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
                canCreate={canCreate}
                onCreate={handleCreate}
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
