import { RadialProgress } from './ui/RadialProgress';
import type { UserStats } from './types';

interface StatisticsOverviewProps {
  stats: UserStats;
}

export function StatisticsOverview({ stats }: StatisticsOverviewProps) {
  return (
    <div className="card bg-base-100 shadow-lg mb-6">
      <div className="card-body">
        <h2 className="card-title mb-6">Your Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <RadialProgress value={stats.meanOverallScore} label="Overall" />
          <RadialProgress value={stats.meanFindable} label="Findable" />
          <RadialProgress value={stats.meanAccessible} label="Accessible" />
          <RadialProgress value={stats.meanInteroperable} label="Interoperable" />
          <RadialProgress value={stats.meanReusable} label="Reusable" />
        </div>
        <div className="divider"></div>
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
          <div className="stat">
            <div className="stat-title">Total FDOs Created</div>
            <div className="stat-value text-primary">{stats.totalFdos}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Mean Overall Score</div>
            <div className="stat-value text-primary">{Math.round(stats.meanOverallScore)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
