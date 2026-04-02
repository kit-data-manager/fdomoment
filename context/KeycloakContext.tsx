'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak, { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';
import { createUser } from '@/lib/database/actions';

interface KeycloakContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  token: string | undefined;
  userName: string | undefined;
  groups: string[];
  isAdmin: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [groups, setGroups] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const storeUser = async (userNameValue: string) => {
    try {
      await createUser({ userName: userNameValue, lastLogin: new Date() });
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  };

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
      setIsLoading(false);
      if (auth && kc.tokenParsed) {
        const userNameValue = kc.tokenParsed['preferred_username'] || kc.tokenParsed['name'];
        const groupsValue = (kc.tokenParsed['groups'] as string[]) || [];
        setUserName(userNameValue);
        setGroups(groupsValue);
        setIsAdmin(groupsValue.includes('ROLE_ADMINISTRATOR'));
        storeUser(userNameValue);
      }
    }).catch((error) => {
      console.error('Keycloak initialization error:', error);
      setKeycloak(kc);
      setAuthenticated(false);
      setIsLoading(false);
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
    <KeycloakContext.Provider value={{ keycloak, authenticated, isLoading, login, logout, token: keycloak?.token, userName, groups, isAdmin }}>
      {children}
    </KeycloakContext.Provider>
  );
}

export function useKeycloak() {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    return {
      keycloak: null,
      authenticated: false,
      isLoading: false,
      login: () => {},
      logout: () => {},
      token: undefined,
      userName: undefined,
      groups: [],
      isAdmin: false,
    };
  }
  return context;
}
