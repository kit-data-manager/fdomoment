'use client';

import { ReactNode } from 'react';
import { KeycloakProvider, useKeycloak } from '@/context/KeycloakContext';
import { ThemeProvider } from '@/context/ThemeContext';

function KeycloakLoader({ children }: { children: ReactNode }) {
  const { isLoading } = useKeycloak();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Initializing...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

export function KeycloakWrapper({ children }: { children: ReactNode }) {
  return (
    <KeycloakProvider>
      <KeycloakLoader>
        {children}
      </KeycloakLoader>
    </KeycloakProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
