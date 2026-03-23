'use client';

import { EditorState, FairScore, ScoreTip } from '@/lib/momentum/types';
import { calculateFairScore, calculateCurrentTip } from '@/lib/momentum/fairScore';

export function useFairScore(state: EditorState) {
  const score: FairScore = calculateFairScore(state);
  const currentTip: ScoreTip = calculateCurrentTip(state);

  return { score, currentTip };
}
