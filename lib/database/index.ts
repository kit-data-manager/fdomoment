import { Database } from './database';
import { inMemoryDatabase } from './in-memory';
import { createPostgresDatabase } from './postgres';

export * from './types';
export * from './database';
export * from './in-memory';
export * from './postgres';
export * from './actions';

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbType = process.env.DATABASE_TYPE || 'in-memory';
  
  switch (dbType) {
    case 'postgres':
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
      }
      dbInstance = createPostgresDatabase(process.env.DATABASE_URL);
      break;
      case 'in-memory':
    default:
      dbInstance = inMemoryDatabase;
      break;
  }

  await dbInstance.initialize();
  return dbInstance;
}

export function resetDatabase(): void {
  dbInstance = null;
}
