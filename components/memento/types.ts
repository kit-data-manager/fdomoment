import { FdoRecord, FairCriteriumAggregation } from '@/lib/database/types';

export interface UserStats {
  totalFdos: number;
  meanOverallScore: number;
  meanFindable: number;
  meanAccessible: number;
  meanInteroperable: number;
  meanReusable: number;
}

export interface AdminStats {
  totalUsers: number;
  totalFdos: number;
  fdosPerUser: { userName: string; count: number; avgScore: number }[];
}

export interface MementoPageState {
  userFdos: FdoRecord[];
  userStats: UserStats | null;
  adminStats: AdminStats | null;
  isAdmin: boolean;
  isLoading: boolean;
  userName: string | undefined;
  isAuthenticated: boolean;
}
