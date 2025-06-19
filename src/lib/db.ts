// src/lib/db.ts
import { Pool, QueryResultRow } from "pg";      // ahora sí detecta el tipo

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []) {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}
