'use client';

import React, { useState, memo } from 'react';
import FdoDetailPanel from './FdoDetailPanel';
import type { FdoRecord } from '@/lib/database/types';
import { Eye } from 'lucide-react';
import { useFdoDetails } from './hooks/useFdoDetails';
import { createPortal } from 'react-dom';
import {useTheme} from "@/context/ThemeContext";
import {PidComponent} from "@kit-data-manager/react-pid-component";

interface PreviewContentProps {
  pid: string;
}

const PreviewContent = memo(({ pid, onClose }: PreviewContentProps & { onClose?: () => void }) => {
  const { fullFdo, isFdoLoading } = useFdoDetails(pid);
  
  if (isFdoLoading) {
    return (
      <div className="flex items-center justify-center p-4 min-w-[400px] min-h-[200px]">
        <span className="loading loading-spinner loading-md"></span>
        <span className="ml-2">Loading FDO details...</span>
      </div>
    );
  }
  
  if (!fullFdo) {
    return (
      <div className="text-sm text-base-content/70 p-4">
        Unable to load FDO record
      </div>
    );
  }
  
  return (
    <>
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
    </>
  );
});

PreviewContent.displayName = 'PreviewContent';

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
  onSelect?: (fdo: FdoRecord) => void;
  autoSelect?: boolean;
  formMode?: boolean;
  selectedPid?: string | null;
  onSelectionChange?: (pid: string | null) => void;
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
  onSelect,
  autoSelect = false,
  formMode = false,
  selectedPid,
  onSelectionChange,
}: FdoTableProps) {
  const { darkMode } = useTheme();

  const [hoveredPid, setHoveredPid] = useState<string | null>(null);
  const [localSelectedPid, setLocalSelectedPid] = useState<string | null>(null);
  
  const effectiveSelectedPid = formMode ? selectedPid : localSelectedPid;

  const showOrcid = showColumns?.orcid ?? false;
  const showResearchDomain = showColumns?.researchDomain ?? false;
  const totalPages = total ? Math.ceil(total / limit) : 1;
  const selectedFdo = effectiveSelectedPid ? fdos.find(fdo => fdo.pid === effectiveSelectedPid) || null : null;

  const renderSortIndicator = (field: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleRowClick = (fdo: FdoRecord) => {
    if (formMode) {
      onSelectionChange?.(fdo.pid === selectedPid ? null : fdo.pid);
    } else {
      setLocalSelectedPid(fdo.pid === localSelectedPid ? null : fdo.pid);
      onSelect?.(fdo);
    }
  };

  const [previewClicked, setPreviewClicked] = useState(false);

  const handlePreviewClick = (fdo: FdoRecord, event: React.MouseEvent) => {
    event.stopPropagation();
    setHoveredPid(fdo.pid);
    setPreviewClicked(true);
  };
//                      {<code className="text-xs">{fdo.pid.slice(0, 8)}...</code>}
  const renderPreviewCell = (fdo: FdoRecord) => {
    return (
      <td>
        <button 
          className="btn btn-ghost btn-xs"
          onClick={(e) => handlePreviewClick(fdo, e)}
          title="Preview FDO record"
        >
          <Eye className="w-3 h-3" />
        </button>
      </td>
    );
  };

  return (
    <div className="flex gap-4">
      <div className={`card bg-base-100 shadow-lg transition-all ${formMode || !selectedFdo ? 'w-full' : 'w-1/2 min-w-0 hidden md:block'}`}>
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
                {fdos.map((fdo, index) => (
                  <tr
                    key={fdo.pid}
                    className={`cursor-pointer hover ${effectiveSelectedPid === fdo.pid ? 'bg-primary/10' : ''}`}
                    onClick={() => handleRowClick(fdo)}
                  >
                    {renderPreviewCell(fdo)}
                    <td className="whitespace-nowrap w-0">
                        <PidComponent value={fdo.pid} emphasizeComponent={false} hideSubcomponents={true} darkMode={darkMode ? 'dark' : 'light'}/>
                    </td>
                    <td className={selectedFdo ? 'w-full xl:table-cell' : 'w-full'}>{fdo.researchDomain || '-'}</td>
                    <td>
                      <div className="badge badge-primary">{fdo.fairScore}%</div>
                    </td>
                    <td className={selectedFdo ? 'whitespace-nowrap w-0 hidden lg:table-cell' : ''}>{new Date(fdo.createdAt).toLocaleDateString("de",{year:"2-digit",month:"2-digit", day:"2-digit"})}</td>
                    {showOrcid && <td className={selectedFdo ? 'hidden 2xl:table-cell' : ''}>
                      <PidComponent value={fdo.orcid} emphasizeComponent={false} hideSubcomponents={true} darkMode={darkMode ? 'dark' : 'light'}/>
                    </td>}
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

      {!formMode && selectedFdo && (
        <div className="w-full md:w-1/2 flex-shrink-0">
          <FdoDetailPanel
            fdo={selectedFdo}
            onClose={() => setLocalSelectedPid(null)}
          />
        </div>
      )}
      
      {hoveredPid && previewClicked && (
        <PreviewPortal 
          hoveredPid={hoveredPid}
          onClose={() => {
            setHoveredPid(null);
            setPreviewClicked(false);
          }}
        />
      )}
    </div>
  );
}

function PreviewPortal({ 
  hoveredPid, 
  onClose 
}: { 
  hoveredPid: string | null; 
  onClose: () => void;
}) {
  if (!hoveredPid) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card bg-base-100 shadow-2xl border border-base-300 w-full max-w-3xl max-h-[70vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-base-100 border-b px-4 py-3 flex items-center justify-between gap-4 z-10">
          <h3 className="card-title text-base">
            Full FDO Record Preview
          </h3>
          <button 
            className="btn btn-ghost btn-xs btn-circle"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <PreviewContent pid={hoveredPid} onClose={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
