'use client';

import { ReactNode } from 'react';
import { KeycloakProvider } from '@/context/KeycloakContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <KeycloakProvider>
      <ThemeProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </KeycloakProvider>
  );
}
