'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useKeycloak } from '@/context/KeycloakContext';
import { FdoRecord } from '@/lib/database/types';
import { StatisticsOverview, FdoTable, AdminOverview } from '@/components/memento';
import { getFdoRecords, getFairScoreAggregations, getAllUsers } from '@/lib/database/actions';

interface UserStats {
  totalFdos: number;
  meanOverallScore: number;
  meanFindable: number;
  meanAccessible: number;
  meanInteroperable: number;
  meanReusable: number;
}

interface AdminStats {
  totalUsers: number;
  totalFdos: number;
  fdosPerUser: { userName: string; count: number; avgScore: number }[];
}

export default function MementoPage() {
  const { authenticated, userName, isAdmin, login } = useKeycloak();
  const [userFdos, setUserFdos] = useState<FdoRecord[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userName) return;
    
    setIsLoading(true);
    try {
      const fdos = await getFdoRecords(userName);
      const aggs = await getFairScoreAggregations(userName);

      setUserFdos(Array.isArray(fdos) ? fdos : []);

      if (fdos.length > 0) {
        const meanOverall = fdos.reduce((sum, f) => sum + f.fairScore, 0) / fdos.length;
        const findable = aggs.find(a => a.criterium === 'findable');
        const accessible = aggs.find(a => a.criterium === 'accessible');
        const interoperable = aggs.find(a => a.criterium === 'interoperable');
        const reusable = aggs.find(a => a.criterium === 'reusable');

        setUserStats({
          totalFdos: fdos.length,
          meanOverallScore: meanOverall,
          meanFindable: findable?.total || 0,
          meanAccessible: accessible?.total || 0,
          meanInteroperable: interoperable?.total || 0,
          meanReusable: reusable?.total || 0,
        });
      } else {
        setUserStats(null);
      }

      if (isAdmin) {
        const allFdos = await getFdoRecords();
        const users = await getAllUsers();

        const fdosPerUser = users.map(user => {
          const userFdosList = allFdos.filter(f => f.userName === user.userName);
          return {
            userName: user.userName,
            count: userFdosList.length,
            avgScore: userFdosList.length > 0
              ? userFdosList.reduce((sum, f) => sum + f.fairScore, 0) / userFdosList.length
              : 0,
          };
        });

        setAdminStats({
          totalUsers: users.length,
          totalFdos: allFdos.length,
          fdosPerUser: fdosPerUser.sort((a, b) => b.count - a.count),
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userName, isAdmin]);

  useEffect(() => {
    if (authenticated && userName) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [authenticated, userName, isAdmin, fetchData]);

  if (!authenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl">Login Required</h2>
            <p className="py-4">Please log in to view your FDO Memento.</p>
            <div className="card-actions">
              <button onClick={login} className="btn btn-primary">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-8">
      <div className="flex-1">
        {userStats ? (
          <>
            <StatisticsOverview stats={userStats} />
            <FdoTable fdos={userFdos} />
          </>
        ) : (
          <FdoTable fdos={[]} />
        )}

        {isAdmin && adminStats && (
          <AdminOverview stats={adminStats} />
        )}
      </div>
    </div>
  );
}
