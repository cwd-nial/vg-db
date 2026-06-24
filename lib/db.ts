import { Database } from "bun:sqlite";

const db = new Database(process.env.DATABASE_PATH ?? "./games.db", {
  create: true,
});

db.run(`
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
  )
`);

export default db;
