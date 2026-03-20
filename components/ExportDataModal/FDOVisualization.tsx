'use client';

import React from 'react';
import { useFDOVisualization } from './useFDOVisualization';
import { FDOVisualizationProps } from './types';

export function FDOVisualization({ data }: FDOVisualizationProps) {
  const { containerRef, renderVisualization, cleanup } = useFDOVisualization();

  React.useEffect(() => {
    renderVisualization(data);
    return cleanup;
  }, [data, renderVisualization, cleanup]);

  return <div ref={containerRef} className="w-full h-[600px] border border-base-300 rounded-lg" />;
}

export default FDOVisualization;
