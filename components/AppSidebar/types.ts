export interface AppSidebarProps {
    allModuleTypes: string[];
    moduleStatus: Record<string, string>;
    getExclusiveInfo: (type: string) => { types: string[]; icon: string } | null;
    onAddModule: (title: string) => void;
    onExportData?: () => void;
}
