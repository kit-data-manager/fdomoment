import Link from 'next/link';
import type { FdoRecord } from '@/lib/database/types';

interface FdoTableProps {
  fdos: FdoRecord[];
}

export function FdoTable({ fdos }: FdoTableProps) {
  if (fdos.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body items-center text-center py-12">
          <h2 className="card-title text-2xl mb-4">No Statistics Yet</h2>
          <p className="text-base-content/70 mb-6">
            Create your first FDO to see your statistics here.
          </p>
          <Link href="/momentum" className="btn btn-primary">
            Create FDO
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title mb-4">Your FDOs</h2>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>PID</th>
                <th>ORCID</th>
                <th>Research Domain</th>
                <th>FAIR Score</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {fdos.map((fdo) => (
                <tr key={fdo.pid}>
                  <td>
                    <code className="text-xs">{fdo.pid.slice(0, 8)}...</code>
                  </td>
                  <td>{fdo.orcid || '-'}</td>
                  <td>{fdo.researchDomain || '-'}</td>
                  <td>
                    <div className="badge badge-primary">{fdo.fairScore}%</div>
                  </td>
                  <td>{new Date(fdo.createdAt).toLocaleDateString("de",{year:"2-digit",month:"2-digit", day:"2-digit"})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
