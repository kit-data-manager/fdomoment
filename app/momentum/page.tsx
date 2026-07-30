'use client';

import { useEditorState } from '@/hooks/momentum/useEditorState';
import { EditorShell } from '@/components/momentum/EditorShell';
import React from "react";
import {useKeycloak} from "@/context/KeycloakContext";

export default function EditorPage() {
  const editorState = useEditorState();
  const { authenticated, userName, isAdmin, login } = useKeycloak();


  if (!authenticated) {
    return (
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-base-100 shadow-xl max-w-md w-full">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl">Login Required</h2>
              <p className="py-4">Please log in to access FAIR DO Momentum.</p>
              <div className="card-actions">
                <button onClick={login} className="btn btn-primary">
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
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
      resetState={editorState.resetState}
    />
  );
}
