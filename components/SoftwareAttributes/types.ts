import { RepositoryType } from '@/utils/git-client';

export interface SoftwareModuleData {
    repositoryType?: RepositoryType,
    softwareLocation?: string,
    license_id?: string,
    license_name?: string,
    readmeLocation?: string
}

export interface SoftwareModuleProps {
    onDataChange: (data: SoftwareModuleData) => void;
    showHelp?: boolean;
}
