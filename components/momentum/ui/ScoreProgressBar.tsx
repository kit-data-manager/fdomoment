'use client';

import React from 'react';

interface ScoreProgressBarProps {
  label: string;
  value: number;
  size?: 'sm' | 'md';
}

export function ScoreProgressBar({
  label,
  value,
  size = 'md',
}: ScoreProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  const getColorClass = (val: number) => {
    if (val < 40) return 'bg-error';
    if (val < 70) return 'bg-warning';
    return 'bg-success';
  };

  const sizeClasses = {
    sm: {
      bar: 'w-20 h-2',
      label: 'text-xs',
      percentage: 'text-xs',
    },
    md: {
      bar: 'w-[80px] h-[6px]',
      label: 'text-sm',
      percentage: 'text-sm',
    },
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`font-bold ${sizeClasses[size].label} w-4`}>
        {label}
      </span>
      <div className={`bg-base-300 rounded-full overflow-hidden ${sizeClasses[size].bar}`}>
        <div
          className={`h-full ${getColorClass(clampedValue)} transition-all duration-500`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      <span className={`${sizeClasses[size].percentage} w-10 text-right`}>
        {Math.round(clampedValue)}%
      </span>
    </div>
  );
}
