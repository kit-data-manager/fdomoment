'use client';

import React from 'react';
import { MiscEntry } from '@/lib/momentum/types';
import {Trash2} from "lucide-react";

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
          <span className="text-sm mr-2">Recommendations:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestedKeys.slice(0, 6).map(key => (
              <button
                key={key}
                onClick={() => addSuggestedKey(key)}
                className="text-xs badge badge-primary"
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
              placeholder="Key"
              list={`suggestions-${entry.id}`}
              className="w-[140px] px-3 py-2 input"
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
              placeholder="Value"
              className="flex-1 px-3 py-2 input"
            />
            <button
              onClick={() => removeEntry(entry.id)}
              className="btn-soft btn-primary px-2"
              title="Remove"
            >
            <Trash2 width="16" height="16" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addEntry}
        className="btn btn-soft btn-primary mt-3"
      >
        + Add more
      </button>
    </div>
  );
}
