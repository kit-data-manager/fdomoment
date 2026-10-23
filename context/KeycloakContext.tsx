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

const keycloakInitOptions: KeycloakInitOptions = {
  onLoad: 'check-sso',
  checkLoginIframe: true,
  pkceMethod: 'S256',
};

let keycloakInstance: Keycloak | null = null;
let keycloakInitPromise: Promise<boolean> | null = null;
let keycloakAuthResult: boolean | null = null;

function getKeycloak(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
}

function getKeycloakInitPromise(): Promise<boolean> {
  if (!keycloakInitPromise) {
    keycloakInitPromise = getKeycloak().init(keycloakInitOptions);
  }
  return keycloakInitPromise;
}

export function KeycloakProvider({ children }: { children: ReactNode }) {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(keycloakInstance);
  const [authenticated, setAuthenticated] = useState<boolean>(keycloakAuthResult ?? false);
  const [isLoading, setIsLoading] = useState<boolean>(keycloakAuthResult === null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [groups, setGroups] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const storeUser = async (userNameValue: string) => {
    try {
      await createUser({ userName: userNameValue, lastLogin: new Date() });
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  };

  useEffect(() => {
    const kc = getKeycloak();

    const applyAuth = (auth: boolean) => {
      setKeycloak(kc);
      setAuthenticated(auth);
      setIsLoading(false);
      if (auth && kc.tokenParsed) {
        const userNameValue = kc.tokenParsed['preferred_username'] || kc.tokenParsed['name'];
        const groupsValue = (kc.tokenParsed['groups'] as string[]) || [];
        setUserName(userNameValue);
        setGroups(groupsValue);
        setIsAdmin(groupsValue.includes('ROLE_ADMINISTRATOR'));
      }
    };

    kc.onTokenExpired = () => {
      kc.updateToken(30)
        .then((updated: boolean) => {
          if (updated) {
            console.log('Token refreshed successfully');
          } else {
            console.log('Token is still valid');
          }
        })
        .catch((error: unknown) => {
          console.error('Failed to refresh token, user may need to re-authenticate:', error);
        });
    };

    kc.onAuthRefreshSuccess = () => {
      console.log('Token refresh successful');
    };

    kc.onAuthRefreshError = () => {
      console.error('Token refresh error');
    };

    kc.onAuthLogout = () => {
      setAuthenticated(false);
      setUserName(undefined);
      setGroups([]);
      setIsAdmin(false);
    };

    if (keycloakAuthResult !== null) {
      applyAuth(keycloakAuthResult);
      return;
    }

    getKeycloakInitPromise()
      .then((auth: boolean) => {
        keycloakAuthResult = auth;
        applyAuth(auth);
        if (auth && kc.tokenParsed) {
          storeUser(kc.tokenParsed['preferred_username'] || kc.tokenParsed['name']);
        }
      })
      .catch((error: unknown) => {
        console.error('Keycloak initialization error:', error);
        keycloakAuthResult = false;
        applyAuth(false);
      });
  }, []);

  useEffect(() => {
    if (keycloak && authenticated) {
      const intervalId = setInterval(() => {
        if (keycloak.isTokenExpired()) {
          keycloak.updateToken(30)
            .then((updated: boolean) => {
              if (updated) {
                console.log('Token refreshed proactively');
              }
            })
            .catch((error: unknown) => {
              console.error('Proactive token refresh failed:', error);
            });
        }
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [keycloak, authenticated]);

  const login = () => {
    if (keycloak) {
      keycloak.login({
        redirectUri: window.location.origin + window.location.pathname,
      });
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
