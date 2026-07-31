import {Pool} from 'pg';
import {Database} from './database';
import {FdoRecord, FairCriteriumAggregation, User, AttributeTemplate} from './types';

export function createPostgresDatabase(dbHost: string, dbPort: number, dbUser: string, dbPassword: string, dbDatabase: string): Database {
    const pool = new Pool({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbDatabase
    });

    return {
        async initialize(): Promise<void> {
            const client = await pool.connect();
            try {
                await client.query(`
                    CREATE TABLE IF NOT EXISTS users
                    (
                        user_name
                        VARCHAR
                    (
                        255
                    ) PRIMARY KEY,
                        orcid VARCHAR
                    (
                        255
                    ),
                        email VARCHAR
                    (
                        255
                    ),
                        last_login TIMESTAMP NOT NULL
                        )
                `);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS fdo_records
                    (
                        pid
                        VARCHAR
                    (
                        255
                    ) PRIMARY KEY,
                        user_name VARCHAR
                    (
                        255
                    ) NOT NULL,
                        orcid VARCHAR
                    (
                        255
                    ),
                        research_domain VARCHAR
                    (
                        255
                    ),
                        fair_score INTEGER NOT NULL,
                        created_at TIMESTAMP NOT NULL,
                        FOREIGN KEY
                    (
                        user_name
                    ) REFERENCES users
                    (
                        user_name
                    )
                        )
                `);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS fair_score_aggregations
                    (
                        id
                        SERIAL
                        PRIMARY
                        KEY,
                        user_name
                        VARCHAR
                    (
                        255
                    ) NOT NULL,
                        criterium VARCHAR
                    (
                        50
                    ) NOT NULL,
                        total INTEGER NOT NULL,
                        UNIQUE
                    (
                        user_name,
                        criterium
                    ),
                        FOREIGN KEY
                    (
                        user_name
                    ) REFERENCES users
                    (
                        user_name
                    )
                        )
                `);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS attribute_templates
                    (
                        id
                        VARCHAR
                    (
                        255
                    ) PRIMARY KEY,
                        user_name VARCHAR
                    (
                        255
                    ) NOT NULL,
                        name VARCHAR
                    (
                        255
                    ) NOT NULL,
                        entries JSONB NOT NULL,
                        created_at TIMESTAMP NOT NULL,
                        updated_at TIMESTAMP NOT NULL,
                        FOREIGN KEY
                    (
                        user_name
                    ) REFERENCES users
                    (
                        user_name
                    )
                        )
                `);

                console.log('PostgresDatabase initialized');
            } finally {
                client.release();
            }
        },

        user: {
            async createOrUpdate(user: User): Promise<void> {
                await pool.query(
                    `INSERT INTO users (user_name, orcid, email, last_login)
                     VALUES ($1, $2, $3, $4) ON CONFLICT (user_name)
           DO
                    UPDATE SET last_login = $4, orcid = COALESCE ($2, users.orcid), email = COALESCE ($3, users.email)`,
                    [user.userName, user.orcid || null, user.email || null, new Date()]
                );
            },

            async findByUserName(userName: string): Promise<User | null> {
                const result = await pool.query(
                    'SELECT * FROM users WHERE user_name = $1',
                    [userName]
                );
                if (result.rows.length === 0) return null;
                const row = result.rows[0];
                return {
                    userName: row.user_name,
                    orcid: row.orcid,
                    email: row.email,
                    lastLogin: row.last_login,
                };
            },

            async getAll(): Promise<User[]> {
                const result = await pool.query('SELECT * FROM users');
                return result.rows.map((row) => ({
                    userName: row.user_name,
                    orcid: row.orcid,
                    email: row.email,
                    lastLogin: row.last_login,
                }));
            },
        },

        fdoRecord: {
            async create(record: FdoRecord): Promise<void> {
                await pool.query(
                    `INSERT INTO fdo_records (pid, user_name, orcid, research_domain, fair_score, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (pid) DO NOTHING`,
                    [
                        record.pid,
                        record.userName,
                        record.orcid,
                        record.researchDomain,
                        record.fairScore,
                        record.createdAt || new Date(),
                    ]
                );
            },

            async findByPid(pid: string): Promise<FdoRecord | null> {
                const result = await pool.query(
                    'SELECT * FROM fdo_records WHERE pid = $1',
                    [pid]
                );
                if (result.rows.length === 0) return null;
                const row = result.rows[0];
                return {
                    pid: row.pid,
                    userName: row.user_name,
                    orcid: row.orcid,
                    researchDomain: row.research_domain,
                    fairScore: row.fair_score,
                    createdAt: row.created_at,
                };
            },

            async findByUserName(
                userName: string,
                page?: number,
                limit?: number,
                sortBy?: 'orcid' | 'research_domain' | 'fair_score' | 'created_at',
                sortOrder?: 'asc' | 'desc'
            ): Promise<FdoRecord[]> {
                const orderBy = sortBy || 'created_at';
                const order = sortOrder || 'DESC';
                const offset = page ? (page - 1) * (limit || 100) : 0;
                const queryLimit = limit || 100;

                const result = await pool.query(
                    `SELECT *
                     FROM fdo_records
                     WHERE user_name = $1
                     ORDER BY ${orderBy} ${order} LIMIT $2
                     OFFSET $3`,
                    [userName, queryLimit, offset]
                );
                return result.rows.map((row) => ({
                    pid: row.pid,
                    userName: row.user_name,
                    orcid: row.orcid,
                    researchDomain: row.research_domain,
                    fairScore: row.fair_score,
                    createdAt: row.created_at,
                }));
            },

            async getAll(
                page?: number,
                limit?: number,
                sortBy?: 'orcid' | 'research_domain' | 'fair_score' | 'created_at',
                sortOrder?: 'asc' | 'desc'
            ): Promise<FdoRecord[]> {
                const orderBy = sortBy || 'created_at';
                const order = sortOrder || 'DESC';
                const offset = page ? (page - 1) * (limit || 100) : 0;
                const queryLimit = limit || 100;

                const result = await pool.query(
                    `SELECT *
                     FROM fdo_records
                     ORDER BY ${orderBy} ${order} LIMIT $1
                     OFFSET $2`,
                    [queryLimit, offset]
                );
                return result.rows.map((row) => ({
                    pid: row.pid,
                    userName: row.user_name,
                    orcid: row.orcid,
                    researchDomain: row.research_domain,
                    fairScore: row.fair_score,
                    createdAt: row.created_at,
                }));
            },

            async count(): Promise<number> {
                const result = await pool.query('SELECT COUNT(*) as total FROM fdo_records');
                return parseInt(result.rows[0].total) || 0;
            },
        },

        fairScore: {
            async upsertAggregation(
                userName: string,
                criterium: FairCriteriumAggregation['criterium'],
                value: number
            ): Promise<void> {
                await pool.query(
                    `INSERT INTO fair_score_aggregations (user_name, criterium, total)
                     VALUES ($1, $2, $3) ON CONFLICT (user_name, criterium)
           DO
                    UPDATE SET total = $3`,
                    [userName, criterium, value]
                );
            },

            async getAggregationsByUser(
                userName: string
            ): Promise<FairCriteriumAggregation[]> {
                const result = await pool.query(
                    'SELECT * FROM fair_score_aggregations WHERE user_name = $1',
                    [userName]
                );
                return result.rows.map((row) => ({
                    userName: row.user_name,
                    criterium: row.criterium as FairCriteriumAggregation['criterium'],
                    total: row.total,
                }));
            },

            async getAllAggregations(): Promise<FairCriteriumAggregation[]> {
                const result = await pool.query(
                    'SELECT * FROM fair_score_aggregations'
                );
                return result.rows.map((row) => ({
                    userName: row.user_name,
                    criterium: row.criterium as FairCriteriumAggregation['criterium'],
                    total: row.total,
                }));
            },
        },

        attributeTemplate: {
            async create(template: Omit<AttributeTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AttributeTemplate> {
                const id = crypto.randomUUID();
                const now = new Date();
                const result = await pool.query(
                    `INSERT INTO attribute_templates (id, user_name, name, entries, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [id, template.userName, template.name, JSON.stringify(template.entries), now, now]
                );
                const row = result.rows[0];
                return {
                    id: row.id,
                    userName: row.user_name,
                    name: row.name,
                    entries: row.entries,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                };
            },

            async update(template: Partial<AttributeTemplate> & { id: string }): Promise<AttributeTemplate> {
                const updates: string[] = [];
                const values: any[] = [];
                let paramIndex = 1;

                if (template.name !== undefined) {
                    updates.push(`name = $${paramIndex++}`);
                    values.push(template.name);
                }
                if (template.entries !== undefined) {
                    updates.push(`entries = $${paramIndex++}`);
                    values.push(JSON.stringify(template.entries));
                }
                if (template.userName !== undefined) {
                    updates.push(`user_name = $${paramIndex++}`);
                    values.push(template.userName);
                }

                updates.push(`updated_at = $${paramIndex++}`);
                values.push(new Date());

                values.push(template.id);

                const result = await pool.query(
                    `UPDATE attribute_templates
                     SET ${updates.join(', ')}
                     WHERE id = $${paramIndex} RETURNING *`,
                    values
                );

                if (result.rows.length === 0) {
                    throw new Error(`Template with id ${template.id} not found`);
                }

                const row = result.rows[0];
                return {
                    id: row.id,
                    userName: row.user_name,
                    name: row.name,
                    entries: row.entries,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                };
            },

            async delete(id: string): Promise<void> {
                await pool.query('DELETE FROM attribute_templates WHERE id = $1', [id]);
            },

            async findById(id: string): Promise<AttributeTemplate | null> {
                const result = await pool.query(
                    'SELECT * FROM attribute_templates WHERE id = $1',
                    [id]
                );
                if (result.rows.length === 0) return null;
                const row = result.rows[0];
                return {
                    id: row.id,
                    userName: row.user_name,
                    name: row.name,
                    entries: row.entries,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                };
            },

            async findByUserName(userName: string): Promise<AttributeTemplate[]> {
                const result = await pool.query(
                    'SELECT * FROM attribute_templates WHERE user_name = $1 ORDER BY created_at DESC',
                    [userName]
                );
                return result.rows.map((row) => ({
                    id: row.id,
                    userName: row.user_name,
                    name: row.name,
                    entries: row.entries,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }));
            },
        },
    };
}
