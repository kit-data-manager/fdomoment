'use client';

import React from 'react';
import { EditorHeader } from '@/components/momentum/EditorHeader';
import { KeycloakWrapper } from '@/components/Providers';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeycloakWrapper>
      <div className="flex flex-col h-screen overflow-hidden">
        <EditorHeader />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </KeycloakWrapper>
  );
}
