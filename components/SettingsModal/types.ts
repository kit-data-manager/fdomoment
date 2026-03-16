export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export type TokenRepositoryType = 'GitHub' | 'GitLab.com' | 'Codebase@Helmholtz' | 'GitLab@Kit';
export const REPOSITORY_TYPES: TokenRepositoryType[] = ['GitHub', 'GitLab.com', 'Codebase@Helmholtz', 'GitLab@Kit'];

export interface TokenEntry {
    repoType: TokenRepositoryType;
    token: string;
}

