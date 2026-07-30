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
      if (!process.env.POSTGRES_HOST ||!process.env.POSTGRES_USER ||!process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_DATABASE) {
        throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
      }

      const pgPort = Number(process.env.POSTGRES_PORT ?? 5432);

      dbInstance = createPostgresDatabase(
          process.env.POSTGRES_HOST,
          pgPort,
          process.env.POSTGRES_USER,
          process.env.POSTGRES_PASSWORD,
          process.env.POSTGRES_DATABASE);
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
