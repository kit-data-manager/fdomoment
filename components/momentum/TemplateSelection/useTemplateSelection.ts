export function useTemplateSelection({ onSelectTemplate }: { onSelectTemplate: (templateId: string, enabledModules: string[]) => void }) {
  const handleSelectTemplate = (templateId: string, enabledModules: string[]) => {
    onSelectTemplate(templateId, enabledModules);
  };

  return {
    handleSelectTemplate,
  };
}
