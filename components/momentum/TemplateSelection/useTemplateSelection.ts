import { TemplateType } from '@/lib/momentum/types';
import { TemplateSelectionProps } from './types';

export function useTemplateSelection({ onSelectTemplate }: TemplateSelectionProps) {
  const handleSelectTemplate = (template: TemplateType) => {
    onSelectTemplate(template);
  };

  return {
    handleSelectTemplate,
  };
}
