import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows as T[];
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      join_url TEXT NOT NULL,
      start_date_time TEXT NOT NULL,
      end_date_time TEXT NOT NULL,
      stream_url TEXT,
      home_team_logo TEXT,
      away_team_logo TEXT,
      created_at TEXT NOT NULL,
      watchers TEXT[] DEFAULT '{}',
      notified BOOLEAN DEFAULT FALSE
    );
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stream_url TEXT NOT NULL,
      category TEXT NOT NULL
    );
  `);

  // Seed default channels if empty
  const { rows } = await pool.query("SELECT COUNT(*) FROM channels");
  if (parseInt(rows[0].count) === 0) {
    await pool.query(
      "INSERT INTO channels (id, name, stream_url, category) VALUES (gen_random_uuid(), $1, $2, $3), (gen_random_uuid(), $4, $5, $6), (gen_random_uuid(), $7, $8, $9)",
      ["TV4 Play - SHL", "https://www.tv4play.se/kategorier/shl", "Sports",
       "TV4 Play - Live", "https://www.tv4play.se/live", "Live TV",
       "TV4 Play - Fotboll", "https://www.tv4play.se/kategorier/fotboll", "Sports"]
    );
  }
}

// Auto-init on first import
initDb().catch(console.error);
