'use client';

import React, { useState, memo } from 'react';
import Link from 'next/link';
import FdoDetailPanel from './FdoDetailPanel';
import type { FdoRecord } from '@/lib/database/types';
import { Eye } from 'lucide-react';
import { useFdoDetails } from './hooks/useFdoDetails';

interface PreviewContentProps {
  pid: string;
}

const PreviewContent = memo(({ pid }: PreviewContentProps) => {
  const { fullFdo, isFdoLoading } = useFdoDetails(pid);
  
  if (isFdoLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="loading loading-spinner loading-xs"></span>
        <span className="ml-2 text-xs">Loading FDO details...</span>
      </div>
    );
  }
  
  if (!fullFdo) {
    return (
      <div className="text-xs text-base-content/70 p-4">
        Unable to load FDO record
      </div>
    );
  }
  
  return (
    <table className="table table-compact">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(fullFdo.record).map(([key, value]) => {
          const displayValue = Array.isArray(value) 
            ? value.join(', ') 
            : value;
          return (
            <tr key={key}>
              <td className="text-xs font-mono text-base-content/70">
                {key}
              </td>
              <td className="text-xs">
                {displayValue || '-'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

interface FdoTableProps {
  fdos: FdoRecord[];
  showColumns?: {
    orcid?: boolean;
    researchDomain?: boolean;
  };
  sortBy?: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt') => void;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export function FdoTable({ 
  fdos, 
  showColumns, 
  sortBy, 
  sortOrder, 
  onSort,
  page = 1,
  limit = 10,
  total,
  onPageChange,
}: FdoTableProps) {
  const [selectedFdo, setSelectedFdo] = useState<FdoRecord | null>(null);
  const [hoveredPid, setHoveredPid] = useState<string | null>(null);

  const showOrcid = showColumns?.orcid ?? false;
  const showResearchDomain = showColumns?.researchDomain ?? false;
  const totalPages = total ? Math.ceil(total / limit) : 1;

  const renderSortIndicator = (field: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleRowClick = (fdo: FdoRecord) => {
    setSelectedFdo(prev => prev?.pid === fdo.pid ? null : fdo);
  };

  const renderPreviewCell = (fdo: FdoRecord) => {
    const isHovered = hoveredPid === fdo.pid;
    return (
      <td 
        className="relative overflow-visible"
        onMouseEnter={() => setHoveredPid(fdo.pid)}
        onMouseLeave={() => setHoveredPid(null)}
      >
        <button className="btn btn-ghost btn-xs">
          <Eye className="w-3 h-3" />
        </button>
        
        {isHovered && (
          <div className="absolute left-full top-0 ml-2 w-[600px] max-h-[500px] z-50">
            <div className="card bg-base-100 shadow-xl border border-base-300 max-h-[500px] overflow-y-auto">
              <div className="card-body p-4">
                <h3 className="card-title text-sm mb-2 sticky top-0 bg-base-100 pb-2 border-b">
                  Full FDO Record Preview
                </h3>
                <PreviewContent pid={fdo.pid} />
              </div>
            </div>
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="flex gap-4">
      <div className={`card bg-base-100 shadow-lg transition-all ${selectedFdo ? 'w-1/2 min-w-0 hidden md:block' : 'w-full'}`}>
        <div className="card-body">
          <h2 className="card-title mb-4">
            {showOrcid && showResearchDomain ? 'All FDOs' : 'Your FDOs'}
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th></th>
                  <th>PID</th>
                  <th className={`cursor-pointer ${selectedFdo ? 'hidden xl:table-cell' : ''}`} onClick={() => onSort?.('researchDomain')}>
                    Research Domain{renderSortIndicator('researchDomain')}
                  </th>
                  <th className="cursor-pointer" onClick={() => onSort?.('fairScore')}>
                    FAIR Score{renderSortIndicator('fairScore')}
                  </th>
                  <th className={`cursor-pointer ${selectedFdo ? 'hidden lg:table-cell' : ''}`} onClick={() => onSort?.('createdAt')}>
                    Created{renderSortIndicator('createdAt')}
                  </th>
                  {showOrcid && (
                    <th className={`cursor-pointer ${selectedFdo ? 'hidden 2xl:table-cell' : ''}`} onClick={() => onSort?.('orcid')}>
                      ORCiD{renderSortIndicator('orcid')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {fdos.map((fdo) => (
                  <tr
                    key={fdo.pid}
                    className={`cursor-pointer hover ${selectedFdo?.pid === fdo.pid ? 'bg-primary/10' : ''}`}
                    onClick={() => handleRowClick(fdo)}
                  >
                    {renderPreviewCell(fdo)}
                    <td>
                      <code className="text-xs">{fdo.pid.slice(0, 8)}...</code>
                    </td>
                    <td className={selectedFdo ? 'hidden xl:table-cell' : ''}>{fdo.researchDomain || '-'}</td>
                    <td>
                      <div className="badge badge-primary">{fdo.fairScore}%</div>
                    </td>
                    <td className={selectedFdo ? 'hidden lg:table-cell' : ''}>{new Date(fdo.createdAt).toLocaleDateString("de",{year:"2-digit",month:"2-digit", day:"2-digit"})}</td>
                    {showOrcid && <td className={selectedFdo ? 'hidden 2xl:table-cell' : ''}>{fdo.orcid || '-'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total !== undefined && total > limit && (
            <div className="flex justify-center gap-2 mt-4">
              <button 
                className="btn btn-sm" 
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </button>
              <div className="btn btn-sm disabled">
                Page {page} of {totalPages}
              </div>
              <button 
                className="btn btn-sm" 
                disabled={page === totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedFdo && (
        <div className="w-full md:w-1/2 flex-shrink-0">
          <FdoDetailPanel
            fdo={selectedFdo}
            onClose={() => setSelectedFdo(null)}
          />
        </div>
      )}
    </div>
  );
}
