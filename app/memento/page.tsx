'use client';

import React, { useEffect, useId, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useKeycloak } from '@/context/KeycloakContext';
import { FdoRecord } from '@/lib/database/types';
import { StatisticsOverview, FdoTable, AdminOverview } from '@/components/memento';
import { getFdoRecords, getFairScoreAggregations, getAllUsers } from '@/lib/database/actions';
import { NavigatorModule } from '@/components/momentum/Navigator/NavigatorModule';
import { Menu } from 'lucide-react';

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

type MementoView = 'statistics' | 'fdos' | 'admin' | 'allFdos';

export default function MementoPage() {
  const { authenticated, userName, isAdmin, login } = useKeycloak();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') as MementoView | null;
  const initialPid = searchParams.get('pid');
  const [userFdos, setUserFdos] = useState<FdoRecord[]>([]);
  const [allFdos, setAllFdos] = useState<FdoRecord[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [activeView, setActiveView] = useState<MementoView>(initialView || 'statistics');
  const [isLoading, setIsLoading] = useState(true);
  const [userFdosPage, setUserFdosPage] = useState(1);
  const [userFdosSortBy, setUserFdosSortBy] = useState<'orcid' | 'researchDomain' | 'fairScore' | 'createdAt' | undefined>(undefined);
  const [userFdosSortOrder, setUserFdosSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
  const [totalUserFdos, setTotalUserFdos] = useState<number | undefined>(undefined);
  const [allFdosPage, setAllFdosPage] = useState(1);
  const [allFdosSortBy, setAllFdosSortBy] = useState<'orcid' | 'researchDomain' | 'fairScore' | 'createdAt' | undefined>(undefined);
  const [allFdosSortOrder, setAllFdosSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
  const [totalAllFdos, setTotalAllFdos] = useState<number | undefined>(undefined);
  const drawerId = useId();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setDrawerOpen(mq.matches);

    const handler = (e: MediaQueryListEvent) => setDrawerOpen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const fetchUserFdos = useCallback(async (
    page: number,
    sortBy?: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt',
    sortOrder?: 'asc' | 'desc'
  ) => {
    if (!userName) return;
    try {
      // Fetch all records first to get total count
      const allUserRecords = await getFdoRecords(userName);
      const total = allUserRecords.length;
      
      // Then fetch the page
      const userRecords = await getFdoRecords(userName, page, 10, sortBy, sortOrder);
      setUserFdos(Array.isArray(userRecords) ? userRecords : []);
      if (sortBy !== undefined && sortOrder !== undefined) {
        setUserFdosSortBy(sortBy);
        setUserFdosSortOrder(sortOrder);
      }
      setUserFdosPage(page);
      setTotalUserFdos(total);
    } catch (error) {
      console.error('Failed to fetch user FDOs:', error);
    }
  }, [userName]);

  const fetchData = useCallback(async () => {
    if (!userName) return;
    
    setIsLoading(true);
    try {
      const allUserRecords = await getFdoRecords(userName);
      const total = allUserRecords.length;
      const userRecords = await getFdoRecords(userName, 1, 10, 'createdAt', 'desc');

      setUserFdos(Array.isArray(userRecords) ? userRecords : []);
      setTotalUserFdos(total);

      if (userRecords.length > 0) {
        const meanOverall = userRecords.reduce((sum, f) => sum + f.fairScore, 0) / userRecords.length;
        const aggs = await getFairScoreAggregations(userName);

        const findable = aggs.find(a => a.criterium === 'findable');
        const accessible = aggs.find(a => a.criterium === 'accessible');
        const interoperable = aggs.find(a => a.criterium === 'interoperable');
        const reusable = aggs.find(a => a.criterium === 'reusable');

        setUserStats({
          totalFdos: userRecords.length,
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
        const allRecords = await getFdoRecords(undefined);
        const total = allRecords.length;
        const pageRecords = await getFdoRecords(undefined, 1, 10, 'createdAt', 'desc');
        const users = await getAllUsers();

        const fdosPerUser = users.map(user => {
          const userFdosList = allRecords.filter(f => f.userName === user.userName);
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
          totalFdos: allRecords.length,
          fdosPerUser: fdosPerUser.sort((a, b) => b.count - a.count),
        });

        setAllFdos(Array.isArray(pageRecords) ? pageRecords : []);
        setTotalAllFdos(total);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userName, isAdmin]);

  const fetchAllFdos = useCallback(async (
    page: number,
    sortBy?: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt',
    sortOrder?: 'asc' | 'desc'
  ) => {
    if (!isAdmin) return;
    try {
      // Fetch all records first to get total count
      const allRecords = await getFdoRecords(undefined);
      const total = allRecords.length;
      
      // Then fetch the page
      const pageRecords = await getFdoRecords(undefined, page, 10, sortBy, sortOrder);
      setAllFdos(Array.isArray(pageRecords) ? pageRecords : []);
      if (sortBy !== undefined && sortOrder !== undefined) {
        setAllFdosSortBy(sortBy);
        setAllFdosSortOrder(sortOrder);
      }
      setAllFdosPage(page);
      setTotalAllFdos(total);
    } catch (error) {
      console.error('Failed to fetch all FDOs:', error);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (authenticated && userName) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [authenticated, userName, isAdmin, fetchData]);

  const handleViewClick = (viewId: MementoView) => {
    setActiveView(viewId);
    const mq = window.matchMedia('(min-width: 1024px)');
    if (!mq.matches) {
      setDrawerOpen(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl">Login Required</h2>
            <p className="py-4">Please log in to access FDO Memento.</p>
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

  const views: { id: MementoView, label: string }[] = [
    { id: 'statistics', label: 'Statistics' },
    { id: 'fdos', label: 'Your FAIR DOs' },
    { id: 'allFdos', label: 'All FAIR DOs' },
  ];

  if (isAdmin && adminStats) {
    views.push({ id: 'admin', label: 'Admin Overview' });
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'statistics':
        return <StatisticsOverview stats={userStats} /> ;
      case 'fdos':
        return (
          <FdoTable
            fdos={userFdos}
            showColumns={{ orcid: false, researchDomain: false }}
            sortBy={userFdosSortBy}
            sortOrder={userFdosSortOrder}
            page={userFdosPage}
            limit={10}
            total={totalUserFdos}
            onSort={(field) => {
              const newSortOrder = userFdosSortBy === field && userFdosSortOrder === 'asc' ? 'desc' : 'asc';
              fetchUserFdos(userFdosPage, field, newSortOrder);
            }}
            onPageChange={(page) => fetchUserFdos(page, userFdosSortBy, userFdosSortOrder)}
          />
        );
      case 'allFdos':
        return (
          <FdoTable
            fdos={allFdos}
            showColumns={{ orcid: true, researchDomain: true }}
            sortBy={allFdosSortBy}
            sortOrder={allFdosSortOrder}
            page={allFdosPage}
            limit={10}
            total={totalAllFdos}
            onSort={(field) => {
              const newSortOrder = allFdosSortBy === field && allFdosSortOrder === 'asc' ? 'desc' : 'asc';
              fetchAllFdos(1, field, newSortOrder);
            }}
            onPageChange={(page) => fetchAllFdos(page, allFdosSortBy, allFdosSortOrder)}
          />
        );
      case 'admin':
        return adminStats ? <AdminOverview stats={adminStats} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="drawer lg:drawer-open h-full">
      <input
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={(e) => setDrawerOpen(e.target.checked)}
      />

      <div className="drawer-content flex flex-col h-full">
        <div className="lg:hidden p-2">
          <label htmlFor={drawerId} className="btn btn-ghost btn-sm btn-square">
            <Menu className="w-5 h-5" />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderActiveView()}
        </div>
      </div>

      <div className="drawer-side h-full z-20">
        <label htmlFor={drawerId} className="drawer-overlay" aria-label="Close sidebar" />
        <div className="w-[240px] h-full bg-base-100 border-r border-base-200 overflow-y-auto flex flex-col">
          {views.map((view) => (
            <NavigatorModule
              key={view.id}
              module={view.id}
              status={'pristine'}
              label={view.label}
              isActive={activeView === view.id}
              onClick={() => handleViewClick(view.id)}
            />
          ))}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
