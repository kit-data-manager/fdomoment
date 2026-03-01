import {
    SidebarHeader,
    SidebarMenuItem
} from "@/components/ui/sidebar"
import {Clock, Axe, BookUser} from "lucide-react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export function AppSidebar() {
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
                <ResizablePanel defaultSize="75%">
                    <SidebarMenuItem className={"justify-center p-5"}>
                        <Clock size={24}/>
                    </SidebarMenuItem>
                    <SidebarMenuItem className={"justify-center pl-2"}>
                        <ThemeToggle  />
                    </SidebarMenuItem>

                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize="25%">
                    <div className="flex h-full items-end justify-center p-6">
                        <Axe/>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
        )
}
