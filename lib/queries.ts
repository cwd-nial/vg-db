import type { SQLQueryBindings } from "bun:sqlite";
import db from "./db";
import type { Game, QueryParams, SortField, SortOrder } from "./types";

type CountRow = { count: number };
type YearRow = { release_year: number };

const SORT_COLUMNS: Record<SortField, string> = {
  title: "title",
  release_year: "release_year",
  metacritic_score: "metacritic_score",
};

const SORT_DIRS: Record<SortOrder, string> = {
  asc: "ASC",
  desc: "DESC",
};

export function queryGames(params: Partial<QueryParams>): {
  games: Game[];
  total: number;
} {
  const {
    q,
    platform,
    metacritic_min,
    metacritic_max,
    release_year,
    sort = "title",
    order = "asc",
  } = params;

  const conditions: string[] = [];
  const args: SQLQueryBindings[] = [];

  if (q) {
    conditions.push("(LOWER(title) LIKE ? OR LOWER(developer) LIKE ?)");
    const term = `%${q.toLowerCase()}%`;
    args.push(term, term);
  }
  if (platform) {
    conditions.push("platform = ?");
    args.push(platform);
  }
  if (metacritic_min !== undefined) {
    conditions.push("metacritic_score >= ?");
    args.push(metacritic_min);
  }
  if (metacritic_max !== undefined && metacritic_max < 100) {
    conditions.push("metacritic_score <= ?");
    args.push(metacritic_max);
  }
  if (release_year !== undefined) {
    conditions.push("release_year = ?");
    args.push(release_year);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const col = SORT_COLUMNS[sort];
  const dir = SORT_DIRS[order];

  const games = db
    .query<Game, SQLQueryBindings[]>(`SELECT * FROM games ${where} ORDER BY ${col} ${dir}`)
    .all(...args);

  const countRow = db
    .query<CountRow, SQLQueryBindings[]>(`SELECT COUNT(*) as count FROM games ${where}`)
    .get(...args);

  return { games, total: countRow?.count ?? 0 };
}

export function queryYears(): number[] {
  return db
    .query<YearRow, []>(
      "SELECT DISTINCT release_year FROM games ORDER BY release_year DESC"
    )
    .all()
    .map((r) => r.release_year);
}
