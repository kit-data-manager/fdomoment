'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';
import {RecordData} from "@/utils/recordBuilder";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  data: RecordData | null;
}

export function ExportDataModal({ isOpen, onClose, onSubmit, data }: ExportDataModalProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTheme = () => {
        const html = document.documentElement;
        const isDarkTheme = html.classList.contains('dark') || 
          html.getAttribute('data-theme') === 'dark' ||
          html.getAttribute('data-theme') === 'black' ||
          html.getAttribute('data-theme') === 'night' ||
          html.getAttribute('data-theme') === 'luxury' ||
          html.getAttribute('data-theme') === 'dracula';
        setIsDark(isDarkTheme);
      };
      
      checkTheme();
      
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });
      
      return () => observer.disconnect();
    }
  }, []);

  const theme = isDark ? githubDarkTheme : githubLightTheme;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-base-content/10">
          <h2 className="text-xl font-semibold">Export FDO Data</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {data ? (
            <JsonView
              value={data}
              style={{
                ...theme,
                backgroundColor: isDark ? 'rgb(13 14 16)' : 'rgb(250 250 250)',
              }}
              displayObjectSize={false}
              displayDataTypes={false}
            />
          ) : (
            <div className="text-center text-base-content/60 py-8">
              No data to export
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-4 border-t border-base-content/10">
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="btn btn-soft btn-primary"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDataModal;
