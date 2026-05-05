'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MiscEntry } from '@/lib/momentum/types';
import { AttributeTemplate } from '@/lib/database/types';
import { useKeycloak } from '@/context/KeycloakContext';

interface AttributeTemplatesTabProps {
  typedAttributes: Array<{ id: string; key: string; typeDef: any; value: any }>;
  customAttributes: MiscEntry[];
  onLoadTemplate: (template: AttributeTemplate) => void;
}

export function AttributeTemplatesTab({
  typedAttributes,
  customAttributes,
  onLoadTemplate,
}: AttributeTemplatesTabProps) {
  const { userName } = useKeycloak();
  const [templates, setTemplates] = useState<AttributeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<'new' | 'update'>('new');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!userName) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/database/attribute-templates?userName=${encodeURIComponent(userName)}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showMessage('error', 'Please enter a template name');
      return;
    }

    if (!userName) {
      showMessage('error', 'User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      const entries: any[] = [
        ...typedAttributes.map(attr => ({
          id: crypto.randomUUID(),
          key: attr.key,
          value: attr.value,
          attributeType: 'typed' as const,
          isTyped: true,
          typeDef: attr.typeDef,
        })),
        ...customAttributes.map(attr => ({
          ...attr,
        })),
      ];

      if (entries.length === 0) {
        showMessage('error', 'Cannot save empty template. Add some attributes first.');
        setIsSaving(false);
        return;
      }

      const payload = {
        userName,
        name: templateName.trim(),
        entries,
      };

      let response: Response;
      
      if (saveMode === 'update' && selectedTemplateId) {
        response = await fetch('/api/database/attribute-templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedTemplateId,
            ...payload,
          }),
        });
      } else {
        response = await fetch('/api/database/attribute-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        showMessage('success', saveMode === 'update' ? 'Template updated successfully' : 'Template saved successfully');
        setTemplateName('');
        setSelectedTemplateId(null);
        setSaveMode('new');
        await fetchTemplates();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      showMessage('error', 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = async (template: AttributeTemplate) => {
    onLoadTemplate(template);
    showMessage('success', `Template "${template.name}" loaded`);
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/database/attribute-templates?id=${encodeURIComponent(templateId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Template deleted successfully');
        if (selectedTemplateId === templateId) {
          setSelectedTemplateId(null);
          setSaveMode('new');
        }
        await fetchTemplates();
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      showMessage('error', 'Failed to delete template');
    }
  };

  const handleSelectTemplateForUpdate = (template: AttributeTemplate) => {
    setSelectedTemplateId(template.id);
    setTemplateName(template.name);
    setSaveMode('update');
  };

  const handleCancelUpdate = () => {
    setSelectedTemplateId(null);
    setTemplateName('');
    setSaveMode('new');
  };

  const hasAttributes = typedAttributes.length > 0 || customAttributes.length > 0;

  return (
    <div className="space-y-4">
      <div className="alert alert-soft">
        <span className="text-xs">
          💡 Save your frequently used attribute combinations as templates for quick reuse. 
          You can load them anytime to populate both typed and custom attributes.
        </span>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} py-2`}>
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Save Template Section */}
      <div className="card bg-base-100 border border-base-200 p-4">
        <h3 className="font-medium mb-3">Save Current Attributes as Template</h3>
        
        {!hasAttributes ? (
          <div className="text-sm text-base-content/70 italic">
            Add some typed or custom attributes first before saving a template.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="label">
                <span className="label-text font-medium">Template Name</span>
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="input input-bordered w-full"
                disabled={isSaving}
              />
            </div>

            {saveMode === 'update' && (
              <div className="alert alert-info py-2">
                <span className="text-xs">Updating existing template: <strong>{templateName}</strong></span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="btn btn-primary btn-sm"
                disabled={isSaving || !templateName.trim()}
              >
                {isSaving ? 'Saving...' : (saveMode === 'update' ? 'Update Template' : 'Save as New Template')}
              </button>
              
              {saveMode === 'update' && (
                <button
                  type="button"
                  onClick={handleCancelUpdate}
                  className="btn btn-ghost btn-sm"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="text-xs text-base-content/70">
              <p>Currently includes:</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                {typedAttributes.length > 0 && <li>{typedAttributes.length} typed attribute(s)</li>}
                {customAttributes.length > 0 && <li>{customAttributes.length} custom attribute(s)</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Load Template Section */}
      <div className="card bg-base-100 border border-base-200 p-4">
        <h3 className="font-medium mb-3">Load Existing Template</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="ml-2 text-xs">Loading templates...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-sm text-base-content/70 italic">
            No saved templates found. Create one using the form above.
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`card bg-base-200 border ${selectedTemplateId === template.id ? 'border-primary' : 'border-base-200'}`}
              >
                <div className="card-body p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-base-content/70 mt-1">
                        {template.entries.filter((e: any) => e.attributeType === 'typed').length} typed,{' '}
                        {template.entries.filter((e: any) => e.attributeType === 'custom').length} custom attribute(s)
                      </div>
                      <div className="text-xs text-base-content/50 mt-1">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate(template)}
                        className="btn btn-soft btn-primary btn-xs"
                        title="Load this template"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTemplateForUpdate(template)}
                        className="btn btn-soft btn-secondary btn-xs"
                        title="Select for update"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                        className="btn btn-soft btn-error btn-xs"
                        title="Delete template"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
