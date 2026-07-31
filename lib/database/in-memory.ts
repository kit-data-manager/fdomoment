import { Database } from './database';
import { FdoRecord, FairCriteriumAggregation, User, AttributeTemplate } from './types';
import fs from 'fs/promises';
import path from 'path';

declare global {
  var _inMemoryDb: {
    users: Map<string, User>;
    fdoRecords: Map<string, FdoRecord>;
    aggregations: Map<string, FairCriteriumAggregation>;
    attributeTemplates: Map<string, AttributeTemplate>;
  } | undefined;
}

const DATA_DIR = path.join(process.cwd(), 'data', 'database');

interface FileData {
  users: Record<string, User>;
  fdoRecords: Record<string, FdoRecord>;
  aggregations: Record<string, FairCriteriumAggregation>;
  attributeTemplates: Record<string, AttributeTemplate>;
}

let fileData: FileData = {
  users: {},
  fdoRecords: {},
  aggregations: {},
  attributeTemplates: {},
};

let isInitialized = false;

async function loadData(): Promise<void> {
  if (isInitialized) return;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const usersPath = path.join(DATA_DIR, 'users.json');
    const fdoRecordsPath = path.join(DATA_DIR, 'fdo_records.json');
    const aggregationsPath = path.join(DATA_DIR, 'aggregations.json');
    const templatesPath = path.join(DATA_DIR, 'attribute_templates.json');

    const usersFile = await fs.readFile(usersPath, 'utf8').catch(() => '{}');
    const fdoRecordsFile = await fs.readFile(fdoRecordsPath, 'utf8').catch(() => '{}');
    const aggregationsFile = await fs.readFile(aggregationsPath, 'utf8').catch(() => '{}');
    const templatesFile = await fs.readFile(templatesPath, 'utf8').catch(() => '{}');

    fileData = {
      users: parseUsers(JSON.parse(usersFile)),
      fdoRecords: parseFdoRecords(JSON.parse(fdoRecordsFile)),
      aggregations: JSON.parse(aggregationsFile),
      attributeTemplates: parseAttributeTemplates(JSON.parse(templatesFile)),
    };
  } catch {
    console.log('No existing database files found, starting fresh');
    fileData = {
      users: {},
      fdoRecords: {},
      aggregations: {},
      attributeTemplates: {},
    };
  }

  initializeGlobalDb();
  isInitialized = true;
}

function parseUsers(data: Record<string, any>): Record<string, User> {
  const users: Record<string, User> = {};
  for (const [key, value] of Object.entries(data)) {
    users[key] = {
      userName: value.userName,
      orcid: value.orcid,
      email: value.email,
      lastLogin: value.lastLogin ? new Date(value.lastLogin) : new Date(),
    };
  }
  return users;
}

function parseFdoRecords(data: Record<string, any>): Record<string, FdoRecord> {
  const records: Record<string, FdoRecord> = {};
  for (const [key, value] of Object.entries(data)) {
    records[key] = {
      pid: value.pid,
      userName: value.userName,
      orcid: value.orcid,
      researchDomain: value.researchDomain,
      fairScore: value.fairScore,
      createdAt: value.createdAt ? new Date(value.createdAt) : new Date(),
    };
  }
  return records;
}

function parseAttributeTemplates(data: Record<string, any>): Record<string, AttributeTemplate> {
  const templates: Record<string, AttributeTemplate> = {};
  for (const [key, value] of Object.entries(data)) {
    templates[key] = {
      id: value.id,
      userName: value.userName,
      name: value.name,
      entries: value.entries || [],
      createdAt: value.createdAt ? new Date(value.createdAt) : new Date(),
      updatedAt: value.updatedAt ? new Date(value.updatedAt) : new Date(),
    };
  }
  return templates;
}

function initializeGlobalDb(): void {
  const db = getInMemoryDb();
  
  for (const [key, value] of Object.entries(fileData.users)) {
    db.users.set(key, value);
  }
  
  for (const [key, value] of Object.entries(fileData.fdoRecords)) {
    db.fdoRecords.set(key, value);
  }
  
  for (const [key, value] of Object.entries(fileData.aggregations)) {
    db.aggregations.set(key, value);
  }
  
  for (const [key, value] of Object.entries(fileData.attributeTemplates)) {
    db.attributeTemplates.set(key, value);
  }
}

async function saveData(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    const usersPath = path.join(DATA_DIR, 'users.json');
    const fdoRecordsPath = path.join(DATA_DIR, 'fdo_records.json');
    const aggregationsPath = path.join(DATA_DIR, 'aggregations.json');
    const templatesPath = path.join(DATA_DIR, 'attribute_templates.json');

    const saveUsers = serializeUsers(fileData.users);
    const saveFdoRecords = serializeFdoRecords(fileData.fdoRecords);
    const saveTemplates = serializeAttributeTemplates(fileData.attributeTemplates);

    await fs.writeFile(usersPath, JSON.stringify(saveUsers, null, 2));
    await fs.writeFile(fdoRecordsPath, JSON.stringify(saveFdoRecords, null, 2));
    await fs.writeFile(aggregationsPath, JSON.stringify(fileData.aggregations, null, 2));
    await fs.writeFile(templatesPath, JSON.stringify(saveTemplates, null, 2));
  } catch (error) {
    console.error('Failed to save database files:', error);
  }
}

function serializeUsers(users: Record<string, User>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(users)) {
    result[key] = {
      userName: value.userName,
      orcid: value.orcid,
      email: value.email,
      lastLogin: value.lastLogin ? value.lastLogin.toISOString() : new Date().toISOString(),
    };
  }
  return result;
}

function serializeFdoRecords(records: Record<string, FdoRecord>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(records)) {
    result[key] = {
      pid: value.pid,
      userName: value.userName,
      orcid: value.orcid,
      researchDomain: value.researchDomain,
      fairScore: value.fairScore,
      createdAt: value.createdAt ? value.createdAt.toISOString() : new Date().toISOString(),
    };
  }
  return result;
}

function serializeAttributeTemplates(templates: Record<string, AttributeTemplate>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(templates)) {
    result[key] = {
      id: value.id,
      userName: value.userName,
      name: value.name,
      entries: value.entries,
      createdAt: value.createdAt ? value.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: value.updatedAt ? value.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
  return result;
}

function getInMemoryDb() {
  if (!global._inMemoryDb) {
    global._inMemoryDb = {
      users: new Map(),
      fdoRecords: new Map(),
      aggregations: new Map(),
      attributeTemplates: new Map(),
    };
  }
  return global._inMemoryDb;
}

export const inMemoryDatabase: Database = {
  async initialize(): Promise<void> {
    console.log('InMemoryDatabase initializing...');
    await loadData();
    console.log('InMemoryDatabase initialized');
  },

  user: {
    async createOrUpdate(user: User): Promise<void> {
      await loadData();
      const db = getInMemoryDb();
      db.users.set(user.userName, {
        ...user,
        lastLogin: new Date(),
      });
      fileData.users[user.userName] = {
        ...user,
        lastLogin: new Date(),
      };
      await saveData();
    },

    async findByUserName(userName: string): Promise<User | null> {
      await loadData();
      const db = getInMemoryDb();
      return db.users.get(userName) || null;
    },

    async getAll(): Promise<User[]> {
      await loadData();
      const db = getInMemoryDb();
      return Array.from(db.users.values());
    },
  },

  fdoRecord: {
    async create(record: FdoRecord): Promise<void> {
      await loadData();
      const db = getInMemoryDb();
      db.fdoRecords.set(record.pid, {
        ...record,
        createdAt: new Date(),
      });
      fileData.fdoRecords[record.pid] = {
        ...record,
        createdAt: new Date(),
      };
      await saveData();
    },

    async findByPid(pid: string): Promise<FdoRecord | null> {
      await loadData();
      const db = getInMemoryDb();
      return db.fdoRecords.get(pid) || null;
    },

    async findByUserName(
      userName: string,
      page?: number,
      limit?: number,
      sortBy?: 'orcid' | 'research_domain' | 'fair_score' | 'created_at',
      sortOrder?: 'asc' | 'desc'
    ): Promise<FdoRecord[]> {
      await loadData();
      const db = getInMemoryDb();
      const records: FdoRecord[] = Array.from(db.fdoRecords.values()).filter(
        (record) => record.userName === userName
      ) as FdoRecord[];
      if (sortBy) {
        records.sort((a, b) => {
          let cmp = 0;
          if (sortBy === 'orcid') cmp = (a.orcid || '').localeCompare(b.orcid || '');
          else if (sortBy === 'research_domain') cmp = (a.researchDomain || '').localeCompare(b.researchDomain || '');
          else if (sortBy === 'fair_score') cmp = a.fairScore - b.fairScore;
          else if (sortBy === 'created_at') cmp = a.createdAt.getTime() - b.createdAt.getTime();
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
      sortBy?: 'orcid' | 'research_domain' | 'fair_score' | 'created_at',
      sortOrder?: 'asc' | 'desc'
    ): Promise<FdoRecord[]> {
      await loadData();
      const db = getInMemoryDb();
      const records: FdoRecord[] = Array.from(db.fdoRecords.values()) as FdoRecord[];
      if (sortBy) {
        records.sort((a, b) => {
          let cmp = 0;
          if (sortBy === 'orcid') cmp = (a.orcid || '').localeCompare(b.orcid || '');
          else if (sortBy === 'research_domain') cmp = (a.researchDomain || '').localeCompare(b.researchDomain || '');
          else if (sortBy === 'fair_score') cmp = a.fairScore - b.fairScore;
          else if (sortBy === 'created_at') cmp = a.createdAt.getTime() - b.createdAt.getTime();
          return sortOrder === 'desc' ? -cmp : cmp;
        });
      }
      if (page !== undefined && limit !== undefined) {
        const start = (page - 1) * limit;
        return records.slice(start, start + limit);
      }
      return records;
    },

    async count(): Promise<number> {
      await loadData();
      const db = getInMemoryDb();
      return db.fdoRecords.size;
    },
  },

  fairScore: {
    async upsertAggregation(
      userName: string,
      criterium: FairCriteriumAggregation['criterium'],
      value: number
    ): Promise<void> {
      await loadData();
      const db = getInMemoryDb();
      const key = `${userName}:${criterium}`;
      db.aggregations.set(key, {
        userName,
        criterium,
        total: value,
      });
      fileData.aggregations[key] = {
        userName,
        criterium,
        total: value,
      };
      await saveData();
    },

    async getAggregationsByUser(
      userName: string
    ): Promise<FairCriteriumAggregation[]> {
      await loadData();
      const db = getInMemoryDb();
      return Array.from(db.aggregations.values()).filter(
        (agg) => agg.userName === userName
      );
    },

    async getAllAggregations(): Promise<FairCriteriumAggregation[]> {
      await loadData();
      const db = getInMemoryDb();
      return Array.from(db.aggregations.values());
    },
  },

  attributeTemplate: {
    async create(template: Omit<AttributeTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AttributeTemplate> {
      await loadData();
      const db = getInMemoryDb();
      const id = crypto.randomUUID();
      const now = new Date();
      const newTemplate: AttributeTemplate = {
        ...template,
        id,
        createdAt: now,
        updatedAt: now,
      };
      db.attributeTemplates.set(id, newTemplate);
      fileData.attributeTemplates[id] = newTemplate;
      await saveData();
      return newTemplate;
    },

    async update(template: Partial<AttributeTemplate> & { id: string }): Promise<AttributeTemplate> {
      await loadData();
      const db = getInMemoryDb();
      const existing = db.attributeTemplates.get(template.id);
      if (!existing) {
        throw new Error(`Template with id ${template.id} not found`);
      }
      const updated: AttributeTemplate = {
        ...existing,
        ...template,
        updatedAt: new Date(),
      };
      db.attributeTemplates.set(template.id, updated);
      fileData.attributeTemplates[template.id] = updated;
      await saveData();
      return updated;
    },

    async delete(id: string): Promise<void> {
      await loadData();
      const db = getInMemoryDb();
      db.attributeTemplates.delete(id);
      delete fileData.attributeTemplates[id];
      await saveData();
    },

    async findById(id: string): Promise<AttributeTemplate | null> {
      await loadData();
      const db = getInMemoryDb();
      return db.attributeTemplates.get(id) || null;
    },

    async findByUserName(userName: string): Promise<AttributeTemplate[]> {
      await loadData();
      const db = getInMemoryDb();
      return Array.from(db.attributeTemplates.values()).filter(
        (template) => template.userName === userName
      );
    },
  },
};
