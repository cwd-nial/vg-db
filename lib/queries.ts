import { getDb } from "./db";
import type { Game, QueryParams, SortField, SortOrder } from "./types";

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

export async function queryGames(
  params: Partial<QueryParams>
): Promise<{ games: Game[]; total: number }> {
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
  const args: (string | number)[] = [];

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

  const [gamesResult, countResult] = await Promise.all([
    getDb().execute({ sql: `SELECT * FROM games ${where} ORDER BY ${col} ${dir}`, args }),
    getDb().execute({ sql: `SELECT COUNT(*) as count FROM games ${where}`, args }),
  ]);

  const games = gamesResult.rows.map((r) => ({
    id: Number(r.id),
    title: r.title as string,
    developer: r.developer as string,
    platform: r.platform as Game["platform"],
    description: r.description as string,
    metacritic_score: r.metacritic_score != null ? Number(r.metacritic_score) : null,
    metacritic_url: r.metacritic_url as string | null,
    release_year: Number(r.release_year),
  }));
  const total = Number(countResult.rows[0]?.count ?? 0);

  return { games, total };
}

export async function queryYears(): Promise<number[]> {
  const result = await getDb().execute(
    "SELECT DISTINCT release_year FROM games ORDER BY release_year DESC"
  );
  return (result.rows as unknown as YearRow[]).map((r) => r.release_year);
}