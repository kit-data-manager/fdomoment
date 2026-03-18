'use client';

import { FdoEditor } from '@/components/fdo-editor';
import { Footer } from '@/components/Footer';

export default function Editor() {
  return (
    <div className="flex flex-col h-screen">
      <FdoEditor />
      <Footer />
    </div>
  );
}
