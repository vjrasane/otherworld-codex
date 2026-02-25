import { Pool, QueryArrayConfig, QueryArrayResult } from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export interface DbClient {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export function getClient(): DbClient {
    return pool;
}
