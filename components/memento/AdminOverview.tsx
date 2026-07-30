import type { AdminStats } from './types';

interface AdminOverviewProps {
  stats: AdminStats;
}

export function AdminOverview({ stats }: AdminOverviewProps) {
  return (
    <div className="card bg-base-100 shadow-lg mt-6">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="card-title">Administrator Overview</h2>
          <span className="badge badge-secondary">ADMIN</span>
        </div>
        
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
          <div className="stat">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-secondary">{stats.totalUsers}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total FDOs</div>
            <div className="stat-value text-secondary">{stats.totalFdos}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>FAIR DOs Created</th>
                <th>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.fdosPerUser.map((user) => (
                <tr key={user.userName}>
                  <td className="font-medium">{user.userName}</td>
                  <td>{user.count}</td>
                  <td>
                    {user.avgScore > 0 ? (
                      <div className="badge badge-outline">{Math.round(user.avgScore)}%</div>
                    ) : (
                      <span className="text-base-content/50">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
