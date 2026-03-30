'use client';

import React from 'react';
import { EditorHeader } from '@/components/momentum/EditorHeader';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorHeader />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
