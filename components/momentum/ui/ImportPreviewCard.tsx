'use client';

import React from 'react';

interface ImportPreviewCardProps {
  title: string;
  fields: { label: string; value: string }[];
  onAccept: () => void;
  onEdit: () => void;
  onDismiss?: () => void;
}

export function ImportPreviewCard({
  title,
  fields,
  onAccept,
  onEdit,
  onDismiss,
}: ImportPreviewCardProps) {
  return (
    <div className="alert alert-info mt-2">
      <div className="flex-1">
        <div className="text-sm font-bold mb-2">📥 {title}</div>
        <div className="space-y-1 text-sm">
          {fields.map((field, index) => (
            <div key={index}>
              <span className="font-medium">{field.label}:</span> {field.value}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={onAccept}
          className="btn btn-primary btn-sm"
        >
          ✅ Daten übernehmen
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="btn btn-ghost btn-sm"
        >
          ✏️ Manuell bearbeiten
        </button>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="btn btn-ghost btn-sm btn-circle"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
