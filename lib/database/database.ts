import { FdoRecord, FairCriteriumAggregation, User, AttributeTemplate } from './types';

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
    findByUserName(
      userName: string,
      page?: number,
      limit?: number,
      sortBy?: 'orcid' | 'research_domain' | 'fair_score' | 'created_at',
      sortOrder?: 'asc' | 'desc'
    ): Promise<FdoRecord[]>;
    getAll(
      page?: number,
      limit?: number,
      sortBy?: 'orcid' | 'research_domain' | 'fair_score' | 'created_at',
      sortOrder?: 'asc' | 'desc'
    ): Promise<FdoRecord[]>;
    count(): Promise<number>;
  };
  
  fairScore: {
    upsertAggregation(userName: string, criterium: FairCriteriumAggregation['criterium'], value: number): Promise<void>;
    getAggregationsByUser(userName: string): Promise<FairCriteriumAggregation[]>;
    getAllAggregations(): Promise<FairCriteriumAggregation[]>;
  };

  attributeTemplate: {
    create(template: Omit<AttributeTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttributeTemplate>;
    update(template: Partial<AttributeTemplate> & { id: string }): Promise<AttributeTemplate>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<AttributeTemplate | null>;
    findByUserName(userName: string): Promise<AttributeTemplate[]>;
  };
}
