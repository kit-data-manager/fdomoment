'use client';

import { useEditorState } from '@/hooks/momentum/useEditorState';
import { EditorShell } from '@/components/momentum/EditorShell';
import { KeycloakWrapper } from '@/components/Providers';

export default function EditorPage() {
  const editorState = useEditorState();

  return (
    <KeycloakWrapper>
      <EditorShell
        state={editorState.state}
        updateBasis={editorState.updateBasis}
        updateDataset={editorState.updateDataset}
        updateSoftware={editorState.updateSoftware}
        updatePublication={editorState.updatePublication}
        updateMisc={editorState.updateMisc}
        setTemplate={editorState.setTemplate}
        setActiveModule={editorState.setActiveModule as (module: string) => void}
        canCreate={editorState.canCreate}
      />
    </KeycloakWrapper>
  );
}
