import Link from 'next/link';
import type { FdoRecord } from '@/lib/database/types';

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
  onPageChange
}: FdoTableProps) {
  const showOrcid = showColumns?.orcid ?? false;
  const showResearchDomain = showColumns?.researchDomain ?? false;
  const totalPages = total ? Math.ceil(total / limit) : 1;

  if (fdos.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body items-center text-center py-12">
          <h2 className="card-title text-2xl mb-4">No FDOs Yet</h2>
          <p className="text-base-content/70 mb-6">
            {showOrcid && showResearchDomain ? 'No FDOs available in the system.' : 'Create your first FDO to see your statistics here.'}
          </p>
          {!showOrcid && showResearchDomain && (
            <Link href="/momentum" className="btn btn-primary">
              Create FDO
            </Link>
          )}
        </div>
      </div>
    );
  }

  const renderSortIndicator = (field: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title mb-4">
          {showOrcid && showResearchDomain ? 'All FDOs' : 'Your FDOs'}
        </h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>PID</th>
                {showOrcid && (
                  <th className="cursor-pointer" onClick={() => onSort?.('orcid')}>
                    ORCiD{renderSortIndicator('orcid')}
                  </th>
                )}
                {showResearchDomain && (
                  <th className="cursor-pointer" onClick={() => onSort?.('researchDomain')}>
                    Research Domain{renderSortIndicator('researchDomain')}
                  </th>
                )}
                <th className="cursor-pointer" onClick={() => onSort?.('fairScore')}>
                  FAIR Score{renderSortIndicator('fairScore')}
                </th>
                <th className="cursor-pointer" onClick={() => onSort?.('createdAt')}>
                  Created{renderSortIndicator('createdAt')}
                </th>
              </tr>
            </thead>
            <tbody>
              {fdos.map((fdo) => (
                <tr key={fdo.pid}>
                  <td>
                    <code className="text-xs">{fdo.pid.slice(0, 8)}...</code>
                  </td>
                  {showOrcid && <td>{fdo.orcid || '-'}</td>}
                  {showResearchDomain && <td>{fdo.researchDomain || '-'}</td>}
                  <td>
                    <div className="badge badge-primary">{fdo.fairScore}%</div>
                  </td>
                  <td>{new Date(fdo.createdAt).toLocaleDateString("de",{year:"2-digit",month:"2-digit", day:"2-digit"})}</td>
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
  );
}
