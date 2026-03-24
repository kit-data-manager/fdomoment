'use client';

import { useState, useEffect, useCallback } from 'react';
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

const STORAGE_KEY = 'fdmoment-user-settings';

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
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        setTempSettings(parsed);
        
        // Apply theme immediately
        applyTheme(parsed.theme);
        
        // Validate ORCiD if present
        if (parsed.orcid && validateOrcidFormat(parsed.orcid)) {
          getOrcidMetadata(parsed.orcid).then(metadata => {
            if (metadata) {
              setSettings(prev => ({
                ...prev,
                orcidValidated: true,
                orcidName: metadata.name,
                orcidEmail: metadata.email,
              }));
              setTempSettings(prev => ({
                ...prev,
                orcidValidated: true,
                orcidName: metadata.name,
                orcidEmail: metadata.email,
              }));
            }
          });
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
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

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempSettings));
    setSettings(tempSettings);
    
    // Apply theme
    applyTheme(tempSettings.theme);
    
    // Close modal
    if (onClose) {
      onClose();
    }
  }, [tempSettings, applyTheme, onClose]);

  const handleCancel = useCallback(() => {
    setTempSettings(settings);
    applyTheme(settings.theme);
    
    // Close modal
    if (onClose) {
      onClose();
    }
  }, [settings, applyTheme, onClose]);

  return {
    settings,
    tempSettings,
    handleOrcidChange,
    handleResearchDomainChange,
    handleThemeChange,
    handleSave,
    handleCancel,
    RESEARCH_DOMAINS,
    isLoading,
  };
}
