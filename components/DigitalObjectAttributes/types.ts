export interface DigitalObjectModuleData {
    mimeType?:string;
    license_id?: string;
    license_name?: string;
    contentLocation?: string;
}

export interface DigitalObjectModuleProps {
    onDataChange: (data: DigitalObjectModuleData) => void;
    showHelp?: boolean;
}
