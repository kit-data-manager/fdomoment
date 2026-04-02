import { FdoRecord, FairCriteriumAggregation, User } from './types';

export interface Database {
  initialize(): Promise<void>;
  
  user: {
    createOrUpdate(user: User): Promise<void>;
    findByUserName(userName: string): Promise<User | null>;
    getAll(): Promise<User[]>;
  };
  
  fdoRecord: {
    create(record: FdoRecord): Promise<void>;
    findByPid(pid: string): Promise<FdoRecord | null>;
    findByUserName(userName: string): Promise<FdoRecord[]>;
    getAll(): Promise<FdoRecord[]>;
  };
  
  fairScore: {
    upsertAggregation(userName: string, criterium: FairCriteriumAggregation['criterium'], value: number): Promise<void>;
    getAggregationsByUser(userName: string): Promise<FairCriteriumAggregation[]>;
    getAllAggregations(): Promise<FairCriteriumAggregation[]>;
  };
}
