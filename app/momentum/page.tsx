'use client';

import { useEditorState } from '@/hooks/momentum/useEditorState';
import { EditorShell } from '@/components/momentum/EditorShell';

export default function EditorPage() {
  const editorState = useEditorState();

  return (
    <EditorShell
      state={editorState.state}
      updateBasis={editorState.updateBasis}
      updateDataset={editorState.updateDataset}
      updateSoftware={editorState.updateSoftware}
      updatePublication={editorState.updatePublication}
      updateMisc={editorState.updateMisc}
      setObjectType={editorState.setObjectType}
      setActiveModule={editorState.setActiveModule as (module: string) => void}
      activatePublication={editorState.activatePublication}
      activateMisc={editorState.activateMisc}
      deactivatePublication={editorState.deactivatePublication}
      deactivateMisc={editorState.deactivateMisc}
      canCreate={editorState.canCreate}
    />
  );
}
