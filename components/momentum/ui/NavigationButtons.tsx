import React from 'react';

export interface NavigationButtonsProps {
  showPrev: boolean;
  showNext: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export function NavigationButtons({ showPrev, showNext, onPrev, onNext }: NavigationButtonsProps) {
  if (!showPrev && !showNext) return null;

  return (
    <div className="card-actions justify-between mt-6">
      {showPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="btn btn-outline"
        >
          ← Previous
        </button>
      )}
      {!showPrev && <div />}
      {showNext && (
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
        >
          Next →
        </button>
      )}
    </div>
  );
}
