'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { KeycloakWrapper } from '@/components/Providers';

export default function MementoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KeycloakWrapper>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-base-200">
          {children}
        </main>
      </div>
    </KeycloakWrapper>
  );
}
