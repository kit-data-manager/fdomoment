import { useState } from 'react';
import {
    SidebarHeader,
    SidebarMenuItem
} from "@/components/ui/sidebar"
import { Blocks, FileJson, LogIn, LogOut, Settings} from "lucide-react";
import {Icon} from "@iconify/react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import { SettingsModal } from "@/components/SettingsModal";
import { useKeycloak } from '@/context/KeycloakContext';
import { AppSidebarProps } from "@/components/AppSidebar/types";

export function AppSidebar({ allModuleTypes, moduleStatus, getExclusiveInfo, onAddModule, onExportData }: AppSidebarProps) {
    const hasAvailableModules = allModuleTypes.some(type => !moduleStatus[type]);
    const [showSettings, setShowSettings] = useState(false);
    const { authenticated, login, logout } = useKeycloak();

    return (
        <div className="h-screen w-16 flex flex-col">
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
            <ResizablePanelGroup orientation="vertical" className="flex-1 max-w-[64px]">
                <ResizablePanel defaultSize="65%">
                     <SidebarMenuItem className="justify-center pl-2 pb-5" title="Export FDO Data...">
                        <button
                            onClick={() => {
                                onExportData?.();
                            }}
                            className="btn btn-link btn-sm"
                        >
                            <FileJson size={24}/>
                        </button>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="justify-center pl-2 pb-5" title="Add an additional Module">
                        {hasAvailableModules ? (
                            <div className="dropdown dropdown-end">
                                <button tabIndex={0} className="btn  btn-link btn-sm">
                                    <Blocks size={24} />
                                </button>
                                <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52 fixed left-16 mt-2">
                                    {allModuleTypes.map(type => {
                                        const isDisabled = !!moduleStatus[type];
                                        const exclusiveInfo = getExclusiveInfo(type);
                                        return (
                                            <li key={type}>
                                                <button 
                                                    onClick={() => !isDisabled && onAddModule(type)}
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
                        <ThemeToggle />
                    </SidebarMenuItem>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize="35%">
                    <div className="flex h-full items-end justify-center p-4 pb-6">
                        <div className="dropdown dropdown-top dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full w-8 text-xl">
                                    <span>U</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52 mb-2 fixed bottom-12 left-0">
                                {authenticated ? (
                                    <>
                                        <li>
                                            <button onClick={() => setShowSettings(true)}>
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={logout} className="text-error">
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <li>
                                        <button onClick={login} className="text-success">
                                            <LogIn className="w-4 h-4" />
                                            Login
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
}

export default AppSidebar;
