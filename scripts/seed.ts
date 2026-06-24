import db from "../lib/db";

type SeedGame = {
  title: string;
  developer: string;
  platform: string;
  description: string;
  metacritic_score: number | null;
  metacritic_url: string | null;
  release_year: number;
};

const isReset = process.argv.includes("--reset");

if (isReset) {
  await db.executeMultiple(`
    DROP TABLE IF EXISTS games;
    CREATE TABLE IF NOT EXISTS games (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      title            TEXT    NOT NULL,
      developer        TEXT    NOT NULL,
      platform         TEXT    NOT NULL CHECK(platform IN ('PS5', 'Xbox', 'Switch')),
      description      TEXT    NOT NULL,
      metacritic_score INTEGER CHECK(metacritic_score BETWEEN 0 AND 100),
      metacritic_url   TEXT,
      release_year     INTEGER NOT NULL,
      UNIQUE(title, platform)
    );
  `);
  console.log("Table reset.");
} else {
  await db.execute(`CREATE TABLE IF NOT EXISTS games (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    title            TEXT    NOT NULL,
    developer        TEXT    NOT NULL,
    platform         TEXT    NOT NULL CHECK(platform IN ('PS5', 'Xbox', 'Switch')),
    description      TEXT    NOT NULL,
    metacritic_score INTEGER CHECK(metacritic_score BETWEEN 0 AND 100),
    metacritic_url   TEXT,
    release_year     INTEGER NOT NULL,
    UNIQUE(title, platform)
  )`);
}

const games: SeedGame[] = await Bun.file("data/games.json").json();

const statements = games.map((g) => ({
  sql: "INSERT OR IGNORE INTO games (title, developer, platform, description, metacritic_score, metacritic_url, release_year) VALUES (?, ?, ?, ?, ?, ?, ?)",
  args: [g.title, g.developer, g.platform, g.description, g.metacritic_score, g.metacritic_url, g.release_year] as (string | number | null)[],
}));

const results = await db.batch(statements, "write");

const inserted = results.reduce((sum, r) => sum + Number(r.rowsAffected), 0);
const skipped = games.length - inserted;
console.log(`Seeded ${inserted} games, ${skipped} skipped.`);