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

    async findByUserName(userName: string): Promise<FdoRecord[]> {
      const db = getInMemoryDb();
      return Array.from(db.fdoRecords.values()).filter(
        (record) => record.userName === userName
      );
    },

    async getAll(): Promise<FdoRecord[]> {
      const db = getInMemoryDb();
      return Array.from(db.fdoRecords.values());
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
