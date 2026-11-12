import { TemplateDefinition } from '@/lib/momentum/config';

export interface TemplateSelectionProps {
  onSelectTemplate: (templateId: string, enabledModules: string[]) => void;
}

/** Backwards-compatible re-export of the template module entry type. */
export interface TemplateModule {
  moduleId: string;
  selectable: boolean;
  defaultEnabled?: boolean;
}

/** Backwards-compatible re-export of the template type from config. */
export type TemplateConfig = TemplateDefinition;

/**
 * The templates are now driven by static configuration (see lib/momentum/templates.ts).
 * Re-exported here so existing imports keep working.
 */
export { TEMPLATE_DEFINITIONS as TEMPLATES } from '@/lib/momentum/templates';
