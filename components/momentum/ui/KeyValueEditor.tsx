'use client';

import React from 'react';
import { MiscEntry } from '@/lib/momentum/types';

interface KeyValueEditorProps {
  entries: MiscEntry[];
  onChange: (entries: MiscEntry[]) => void;
  suggestedKeys?: string[];
}

export function KeyValueEditor({
  entries,
  onChange,
  suggestedKeys = [],
}: KeyValueEditorProps) {
  const addEntry = () => {
    onChange([
      ...entries,
      { id: crypto.randomUUID(), key: '', value: '' },
    ]);
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter(entry => entry.id !== id));
  };

  const updateEntry = (id: string, field: 'key' | 'value', value: string) => {
    onChange(
      entries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addSuggestedKey = (key: string) => {
    onChange([
      ...entries,
      { id: crypto.randomUUID(), key, value: '' },
    ]);
  };

  return (
    <div className="w-full">
      {suggestedKeys.length > 0 && (
        <div className="mb-3">
          <span className="text-sm text-gray-500 mr-2">Vorschläge:</span>
          <div className="flex flex-wrap gap-2">
            {suggestedKeys.slice(0, 6).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => addSuggestedKey(key)}
                className="text-xs border border-gray-200 rounded-full px-2 py-0.5 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-700"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.id} className="flex gap-2">
            <input
              type="text"
              value={entry.key}
              onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
              placeholder="Schlüssel"
              list={`suggestions-${entry.id}`}
              className="w-[140px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id={`suggestions-${entry.id}`}>
              {suggestedKeys.map(key => (
                <option key={key} value={key} />
              ))}
            </datalist>
            <input
              type="text"
              value={entry.value}
              onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
              placeholder="Wert"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => removeEntry(entry.id)}
              className="text-gray-400 hover:text-red-500 transition-colors px-2"
              title="Entfernen"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="mt-3 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
      >
        + Weiteres Paar hinzufügen
      </button>
    </div>
  );
}
