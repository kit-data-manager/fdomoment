import { useState, useEffect, useCallback } from 'react';
import { TokenEntry, TokenRepositoryType, REPOSITORY_TYPES } from '@/components/SettingsModal/types';
import { RESEARCH_DOMAINS } from '@/lib/momentum/constants';
import { validateOrcidFormat } from '@/lib/momentum/validation';
import { getOrcidMetadata } from '@/utils/orcid-client';

export interface UserSettings {
  orcid: string;
  orcidValidated: boolean;
  orcidName: string | null;
  orcidEmail: string | null;
  researchDomain: string | null;
  theme: 'light' | 'dark' | 'system';
}

const SETTINGS_STORAGE_KEY = 'fdmoment-user-settings';
const TOKENS_STORAGE_KEY = 'fdo-editor-access-tokens';

export function useSettingsModal(onClose?: () => void) {
  const [settings, setSettings] = useState<UserSettings>({
    orcid: '',
    orcidValidated: false,
    orcidName: null,
    orcidEmail: null,
    researchDomain: null,
    theme: 'system',
  });

  const [tempSettings, setTempSettings] = useState<UserSettings>(settings);
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [tempTokens, setTempTokens] = useState<TokenEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'tokens'>('general');
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        setTempSettings(parsed);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
    
    // Load tokens
    const storedTokens = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
        setTempTokens(parsedTokens);
      } catch (e) {
        console.error('Failed to load tokens:', e);
      }
    }
    
    setIsLoading(false);
  }, []);

  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemDark ? 'business' : 'silk');
    } else {
      root.setAttribute('data-theme', theme === 'dark' ? 'business' : 'silk');
    }
  }, []);

  const handleOrcidChange = useCallback((value: string) => {
    setTempSettings(prev => ({
      ...prev,
      orcid: value,
      orcidValidated: false,
      orcidName: null,
      orcidEmail: null,
    }));

    if (value.length >= 19 && validateOrcidFormat(value)) {
      getOrcidMetadata(value).then(metadata => {
        setTempSettings(prev => ({
          ...prev,
          orcidValidated: true,
          orcidName: metadata?.name || 'Verified via ORCiD',
          orcidEmail: metadata?.email || null,
        }));
      });
    }
  }, []);

  const handleResearchDomainChange = useCallback((domainId: string | null) => {
    setTempSettings(prev => ({
      ...prev,
      researchDomain: domainId,
    }));
  }, []);

  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'system') => {
    setTempSettings(prev => ({
      ...prev,
      theme,
    }));
    applyTheme(theme);
  }, [applyTheme]);

  const addToken = () => {
    const usedTypes = tempTokens.map(t => t.repoType);
    const availableTypes = REPOSITORY_TYPES.filter(t => !usedTypes.includes(t));
    if (availableTypes.length > 0) {
      setTempTokens([...tempTokens, { repoType: availableTypes[0], token: '' }]);
    }
  };

  const removeToken = (index: number) => {
    setTempTokens(tempTokens.filter((_, i) => i !== index));
  };

  const handleRepoTypeChange = (index: number, repoType: TokenRepositoryType) => {
    const newTokens = [...tempTokens];
    newTokens[index].repoType = repoType;
    setTempTokens(newTokens);
  };

  const handleTokenValueChange = (index: number, token: string) => {
    const newTokens = [...tempTokens];
    newTokens[index].token = token;
    setTempTokens(newTokens);
  };

  const handleSave = useCallback(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(tempSettings));
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tempTokens));
    setSettings(tempSettings);
    setTokens(tempTokens);
    
    // Apply theme
    applyTheme(tempSettings.theme);
    
    // Close modal
    if (onClose) {
      onClose();
    }
  }, [tempSettings, tempTokens, applyTheme, onClose]);

  const handleCancel = useCallback(() => {
    setTempSettings(settings);
    setTempTokens(tokens);
    applyTheme(settings.theme);
    
    // Close modal
    if (onClose) {
      onClose();
    }
  }, [settings, tokens, applyTheme, onClose]);

  const usedRepoTypes = tempTokens.map(t => t.repoType);
  const availableRepoTypes = REPOSITORY_TYPES.filter(t => !usedRepoTypes.includes(t));

  return {
    settings,
    tempSettings,
    tokens,
    tempTokens,
    activeTab,
    setActiveTab,
    handleOrcidChange,
    handleResearchDomainChange,
    handleThemeChange,
    handleSave,
    handleCancel,
    addToken,
    removeToken,
    handleRepoTypeChange,
    handleTokenValueChange,
    availableRepoTypes,
    REPOSITORY_TYPES,
    RESEARCH_DOMAINS,
    isLoading,
  };
}
