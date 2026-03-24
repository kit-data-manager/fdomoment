'use client';

import React from 'react';
import { EditorState } from '@/lib/momentum/types';
import { useFairScore } from '@/hooks/momentum/useFairScore';
import { ScoreProgressBar } from './ui/ScoreProgressBar';

interface FairScoreBarProps {
  state: EditorState;
  setActiveModule: (module: string) => void;
}

export function FairScoreBar({ state, setActiveModule }: FairScoreBarProps) {
  const { score, currentTip } = useFairScore(state);

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body p-4">
        <h3 className="card-title text-sm mb-3">FAIR Score</h3>
        
        {/* Score Bars */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ScoreProgressBar label="F" value={score.findable} size="sm" />
          <ScoreProgressBar label="A" value={score.accessible} size="sm" />
          <ScoreProgressBar label="I" value={score.interoperable} size="sm" />
          <ScoreProgressBar label="R" value={score.reusable} size="sm" />
        </div>

        {/* Tip Section */}
        <div className="bg-base-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
              {currentTip.scoreGain > 0 ? (<span className="text-lg">💡</span>)
                  : (<span className="text-lg">⭐</span>)
              }
            <div className="flex-1">
              <p className="text-xs text-base-content/80 mb-2">
                {currentTip.text}
              </p>
              {(currentTip.targetModule && currentTip.scoreGain > 0) && (
                <button
                  type="button"
                  onClick={() => setActiveModule(currentTip.targetModule)}
                  className="text-xs text-primary hover:text-primary-focus transition-colors font-medium"
                >
                  Capture now →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Total Score */}
        <div className="mt-4 pt-3 border-t border-base-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-bold text-primary">{Math.round(score.total)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
