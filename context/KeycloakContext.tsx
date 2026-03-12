'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak, { KeycloakConfig } from 'keycloak-js';

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
    
    kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    }).then((auth) => {
      setKeycloak(kc);
      setAuthenticated(auth);
      if (auth && kc.tokenParsed) {
        setUserName(kc.tokenParsed['preferred_username'] || kc.tokenParsed['name']);
      }
    }).catch((error) => {
      console.error('Keycloak initialization error:', error);
    });
  }, []);

  const login = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  const logout = () => {
    if (keycloak) {
      // Federated logout - redirects to Keycloak and logs out from all applications
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
