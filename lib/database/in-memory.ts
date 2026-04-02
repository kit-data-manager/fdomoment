import { Database } from './database';
import { FdoRecord, FairCriteriumAggregation, User } from './types';

declare global {
  // eslint-disable-next-line no-var
  var _inMemoryDb: {
    users: Map<string, User>;
    fdoRecords: Map<string, FdoRecord>;
    aggregations: Map<string, FairCriteriumAggregation>;
  } | undefined;
}

function getInMemoryDb() {
  if (!global._inMemoryDb) {
    global._inMemoryDb = {
      users: new Map(),
      fdoRecords: new Map(),
      aggregations: new Map(),
    };
  }
  return global._inMemoryDb;
}

export const inMemoryDatabase: Database = {
  async initialize(): Promise<void> {
    console.log('InMemoryDatabase initialized');
  },

  user: {
    async createOrUpdate(user: User): Promise<void> {
      const db = getInMemoryDb();
      db.users.set(user.userName, {
        ...user,
        lastLogin: new Date(),
      });
    },

    async findByUserName(userName: string): Promise<User | null> {
      const db = getInMemoryDb();
      return db.users.get(userName) || null;
    },

    async getAll(): Promise<User[]> {
      const db = getInMemoryDb();
      return Array.from(db.users.values());
    },
  },

  fdoRecord: {
    async create(record: FdoRecord): Promise<void> {
      const db = getInMemoryDb();
      db.fdoRecords.set(record.pid, {
        ...record,
        createdAt: new Date(),
      });
    },

    async findByPid(pid: string): Promise<FdoRecord | null> {
      const db = getInMemoryDb();
      return db.fdoRecords.get(pid) || null;
    },

    async findByUserName(
      userName: string,
      page?: number,
      limit?: number,
      sortBy?: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt',
      sortOrder?: 'asc' | 'desc'
    ): Promise<FdoRecord[]> {
      const db = getInMemoryDb();
      const records: FdoRecord[] = Array.from(db.fdoRecords.values()).filter(
        (record) => record.userName === userName
      ) as FdoRecord[];
      if (sortBy) {
        records.sort((a, b) => {
          let cmp = 0;
          if (sortBy === 'orcid') cmp = (a.orcid || '').localeCompare(b.orcid || '');
          else if (sortBy === 'researchDomain') cmp = (a.researchDomain || '').localeCompare(b.researchDomain || '');
          else if (sortBy === 'fairScore') cmp = a.fairScore - b.fairScore;
          else if (sortBy === 'createdAt') cmp = a.createdAt.getTime() - b.createdAt.getTime();
          return sortOrder === 'desc' ? -cmp : cmp;
        });
      }
      if (page !== undefined && limit !== undefined) {
        const start = (page - 1) * limit;
        return records.slice(start, start + limit);
      }
      return records;
    },

    async getAll(
      page?: number,
      limit?: number,
      sortBy?: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt',
      sortOrder?: 'asc' | 'desc'
    ): Promise<FdoRecord[]> {
      const db = getInMemoryDb();
      const records: FdoRecord[] = Array.from(db.fdoRecords.values()) as FdoRecord[];
      if (sortBy) {
        records.sort((a, b) => {
          let cmp = 0;
          if (sortBy === 'orcid') cmp = (a.orcid || '').localeCompare(b.orcid || '');
          else if (sortBy === 'researchDomain') cmp = (a.researchDomain || '').localeCompare(b.researchDomain || '');
          else if (sortBy === 'fairScore') cmp = a.fairScore - b.fairScore;
          else if (sortBy === 'createdAt') cmp = a.createdAt.getTime() - b.createdAt.getTime();
          return sortOrder === 'desc' ? -cmp : cmp;
        });
      }
      if (page !== undefined && limit !== undefined) {
        const start = (page - 1) * limit;
        return records.slice(start, start + limit);
      }
      return records;
    },
  },

  fairScore: {
    async upsertAggregation(
      userName: string,
      criterium: FairCriteriumAggregation['criterium'],
      value: number
    ): Promise<void> {
      const db = getInMemoryDb();
      const key = `${userName}:${criterium}`;
      db.aggregations.set(key, {
        userName,
        criterium,
        total: value,
      });
    },

    async getAggregationsByUser(
      userName: string
    ): Promise<FairCriteriumAggregation[]> {
      const db = getInMemoryDb();
      return Array.from(db.aggregations.values()).filter(
        (agg) => agg.userName === userName
      );
    },

    async getAllAggregations(): Promise<FairCriteriumAggregation[]> {
      const db = getInMemoryDb();
      return Array.from(db.aggregations.values());
    },
  },
};
