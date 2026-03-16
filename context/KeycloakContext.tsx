'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak, { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';

interface KeycloakContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  token: string | undefined;
  userName: string | undefined;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

const keycloakConfig: KeycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || '',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || '',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || '',
};

export function KeycloakProvider({ children }: { children: ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const kc = new Keycloak(keycloakConfig);
    
    const initOptions: KeycloakInitOptions = {
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod: 'S256',
    };
    
    kc.init(initOptions).then((auth) => {
      setKeycloak(kc);
      setAuthenticated(auth);
      if (auth && kc.tokenParsed) {
        setUserName(kc.tokenParsed['preferred_username'] || kc.tokenParsed['name']);
      }
    }).catch((error) => {
      console.error('Keycloak initialization error:', error);
      setKeycloak(kc);
      setAuthenticated(false);
    });
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout({
        redirectUri: window.location.origin,
      });
    }
  };

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, login, logout, token: keycloak?.token, userName }}>
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    throw new Error('useKeycloak must be used within a KeycloakProvider');
  }
  return context;
}
