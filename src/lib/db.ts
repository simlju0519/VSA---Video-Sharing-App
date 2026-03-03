import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.VSA_STORAGE_POSTGRES_URL });

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  await ensureDb();
  const { rows } = await pool.query(text, params);
  return rows as T[];
}

let initialized = false;

export async function ensureDb() {
  if (initialized) return;
  initialized = true;
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
    CREATE TABLE IF NOT EXISTS leagues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subtitle TEXT,
      emoji TEXT NOT NULL DEFAULT '🏆',
      logo_dir TEXT,
      provider TEXT NOT NULL,
      param TEXT NOT NULL,
      category TEXT NOT NULL,
      sort_order INT DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS user_starred_leagues (
      user_email TEXT NOT NULL,
      league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
      PRIMARY KEY (user_email, league_id)
    );
  `);

  const { rows: lr } = await pool.query("SELECT COUNT(*) FROM leagues");
  if (parseInt(lr[0].count) === 0) {
    await pool.query(`INSERT INTO leagues (id, name, subtitle, emoji, logo_dir, provider, param, category, sort_order) VALUES
      ('shl', 'SHL', 'Svenska Hockeyligan', '🏒', 'shl', 'tv4', 'shl', 'Ishockey', 1),
      ('hockeyallsvenskan', 'HockeyAllsvenskan', 'Hockeyallsvenskan', '🏒', 'hockeyallsvenskan', 'tv4', 'hockeyallsvenskan', 'Ishockey', 2),
      ('chl', 'CHL', 'Champions Hockey League', '🏆', 'chl', 'viaplay', 'sport/ishockey/champions-hockey-league', 'Ishockey', 3),
      ('allsvenskan', 'Allsvenskan', 'Svensk Fotboll', '⚽', 'allsvenskan', 'tv4', 'allsvenskan', 'Football', 1),
      ('pl', 'Premier League', 'Engelsk Fotboll', '⚽', 'pl', 'viaplay', 'sport/fotboll/premier-league', 'Football', 2),
      ('f1', 'F1', 'Formel 1', '🏎️', 'f1', 'viaplay', 'sport/motorsport/formel-1', 'Motorsport', 1)
    `);
  }
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
