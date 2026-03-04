import {
    SidebarHeader,
    SidebarMenuItem
} from "@/components/ui/sidebar"
import {Axe, Boxes, Blocks} from "lucide-react";
import {Icon} from "@iconify/react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

interface AppSidebarProps {
    allSectionTypes: string[];
    sectionStatus: Record<string, string>;
    getExclusiveInfo: (type: string) => { types: string[]; icon: string } | null;
    onAddSection: (title: string) => void;
    onCollectData: () => void;
}

export function AppSidebar({ allSectionTypes, sectionStatus, getExclusiveInfo, onAddSection, onCollectData }: AppSidebarProps) {
    const hasAvailableSections = allSectionTypes.some(type => !sectionStatus[type]);

    return (
        <div className="h-full w-16">
            <SidebarHeader>
                <Image
                    className="logo justify-center pl-2"
                    src="/logo_small.png"
                    alt="Next.js logo"
                    width={64}
                    height={64}
                    priority
                />
            </SidebarHeader>
            <ResizablePanelGroup orientation="vertical" className="min-h-lvh max-w-[64px]">
                <ResizablePanel defaultSize="65%">
                    <SidebarMenuItem className="justify-center pl-2 pb-5 pt-5" title="Compile FAIR Digital Object...">
                            <button
                                onClick={onCollectData}
                                className="btn btn-link btn-sm"
                            >
                                <Boxes size={24}/>
                            </button>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="justify-center pl-2 pb-5" title="Add an additional Module">
                        {hasAvailableSections ? (
                            <div className="dropdown dropdown-end">
                                <button tabIndex={0} className="btn  btn-link btn-sm">
                                    <Blocks size={24} />
                                </button>
                                <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52 fixed left-16 mt-2">
                                    {allSectionTypes.map(type => {
                                        const isDisabled = !!sectionStatus[type];
                                        const exclusiveInfo = getExclusiveInfo(type);
                                        return (
                                            <li key={type}>
                                                <button 
                                                    onClick={() => !isDisabled && onAddSection(type)} 
                                                    disabled={isDisabled}
                                                    className={`flex items-center gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {exclusiveInfo && <Icon icon={exclusiveInfo.icon} width={16} />}
                                                    {type}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : (
                            <button className="btn btn-ghost btn-sm" disabled>
                                <Blocks size={24} />
                            </button>
                        )}
                    </SidebarMenuItem>
                    <SidebarMenuItem className="justify-center pl-2" title="Toggle dark/light mode">
                        <ThemeToggle  />
                    </SidebarMenuItem>

                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize="35%">
                    <div className="flex h-full items-end justify-center p-6">
                        <Axe/>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
        )
}
