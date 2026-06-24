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
  db.run("DROP TABLE IF EXISTS games");
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
  console.log("Table reset.");
}

const games: SeedGame[] = await Bun.file("data/games.json").json();

const insert = db.query(
  "INSERT OR IGNORE INTO games (title, developer, platform, description, metacritic_score, metacritic_url, release_year) VALUES (?, ?, ?, ?, ?, ?, ?)"
);

let inserted = 0;

const seed = db.transaction((items: SeedGame[]) => {
  for (const g of items) {
    const result = insert.run(
      g.title,
      g.developer,
      g.platform,
      g.description,
      g.metacritic_score,
      g.metacritic_url,
      g.release_year
    );
    if (result.changes > 0) inserted++;
  }
});

seed(games);

const skipped = games.length - inserted;
console.log(`Seeded ${inserted} games, ${skipped} skipped.`);
