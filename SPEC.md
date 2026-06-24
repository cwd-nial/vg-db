# Technical Specification: Video Game Database

## 1. Overview

A publicly accessible web application for browsing and discovering video games — think IMDb, but for games. Anyone can search and filter the catalog; no login is required. Games are persisted in a SQLite database (via Bun's built-in driver) and served through a Next.js API layer. The UI is built with Next.js (App Router) and styled with Tailwind CSS.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via `bun:sqlite` |
| Data source | JSON seed file |

---

## 3. Data Model

### 3.1 Game Entity

```ts
interface Game {
  id: number;           // Auto-incremented primary key
  title: string;
  developer: string;
  platform: "PS5" | "Xbox" | "Switch";
  description: string;
  metacritic_score: number | null;  // 0–100; null if unscored
  metacritic_url: string | null;
  release_year: number;
}
```

### 3.2 SQLite Schema

```sql
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
```

### 3.3 JSON Seed Format

Games are seeded from `data/games.json`. Shape:

```json
[
  {
    "title": "Astro Bot",
    "developer": "Team Asobi",
    "platform": "PS5",
    "description": "A 3D platformer starring the mascot robot of PlayStation.",
    "metacritic_score": 94,
    "metacritic_url": "https://www.metacritic.com/game/astro-bot/",
    "release_year": 2024
  }
]
```

---

## 4. Project Structure

```
game-db/
├── app/
│   ├── layout.tsx              # Root layout, global styles
│   ├── page.tsx                # Main browse page
│   └── api/
│       └── games/
│           ├── route.ts        # GET /api/games — filtered list
│           └── years/
│               └── route.ts    # GET /api/games/years — distinct release years
├── components/
│   ├── GameCard.tsx            # Individual game card
│   ├── GameGrid.tsx            # Responsive card grid
│   └── FilterBar.tsx           # Filter controls
├── lib/
│   ├── db.ts                   # DB singleton & query helpers
│   └── types.ts                # Shared TypeScript types
├── scripts/
│   └── seed.ts                 # Reads JSON → inserts into SQLite
├── data/
│   └── games.json              # Seed data
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Database Layer (`lib/db.ts`)

Use Bun's built-in `bun:sqlite` — no external dependency required.

```ts
import { Database } from "bun:sqlite";

// Singleton — reused across requests in the same process
const db = new Database(process.env.DATABASE_PATH ?? "./games.db", { create: true });

db.run(`CREATE TABLE IF NOT EXISTS games ( ... )`);

export default db;
```

All queries use raw SQL with prepared statements to prevent injection.

---

## 6. Seeding (`scripts/seed.ts`)

Run once (or on reset) to populate the database from JSON:

```bash
bun run scripts/seed.ts
```

Logic:

1. Read and parse `data/games.json`.
2. Open the SQLite database.
3. Wrap all inserts in a single transaction for performance.
4. Skip rows that already exist (matched via the `UNIQUE(title, platform)` constraint with `INSERT OR IGNORE`).

---

## 7. API

### `GET /api/games`

Returns a filtered, sorted list of games.

**Query parameters** (all optional):

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Case-insensitive substring match across title **and** developer |
| `platform` | `PS5` \| `Xbox` \| `Switch` | Exact match |
| `metacritic_min` | number | Minimum Metacritic score (inclusive) |
| `metacritic_max` | number | Maximum Metacritic score (inclusive) |
| `release_year` | number | Exact year match |
| `sort` | `title` \| `release_year` \| `metacritic_score` | Sort field (default: `title`) |
| `order` | `asc` \| `desc` | Sort direction (default: `asc`) |

**Response:**

```json
{
  "data": [ /* Game[] */ ],
  "total": 42
}
```

**Error response:**

```json
{ "error": "Invalid platform value" }
```

The route handler builds the SQL query dynamically, binding parameters to a prepared statement. No ORM is used.

### `GET /api/games/years`

Returns the list of distinct release years present in the database, sorted descending.

**Response:**

```json
{ "years": [2024, 2023, 2022, 2021, 2020] }
```

---

## 8. UI Components

### 8.1 `FilterBar`

A horizontal bar (collapses to a column on mobile) containing:

- **Search** — free-text input, filters on `title` and `developer` simultaneously (`q` param). Debounced 300 ms.
- **Platform** — dropdown or button group: All / PS5 / Xbox / Switch.
- **Metacritic score** — dual range slider (0–100).
- **Release year** — dropdown populated dynamically from distinct years in the DB.
- **Sort** — field selector + asc/desc toggle.
- **Reset filters** button.

### 8.2 `GameCard`

Displays a single game. Layout:

- Platform badge (colour-coded: PS5 = blue, Xbox = green, Switch = red).
- Title (bold, large).
- Developer and release year (muted, smaller).
- Metacritic score — circular badge, colour by score tier:
  - ≥ 75: green; 50–74: yellow; < 50: red; null: grey.
- Short description (truncated to 3 lines, expandable on click).
- External link to Metacritic (opens in new tab, `rel="noopener noreferrer"`).

### 8.3 `GameGrid`

Responsive CSS grid wrapping `GameCard` components:

- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Wide (xl): 4 columns

---

## 9. State Management

No external state library is needed at this scale. Use:

- `useState` / `useReducer` in the main page component to hold filter state.
- `useEffect` + `fetch` to re-query the API whenever filter state changes.
- URL search params (`useRouter` / `useSearchParams`) to make filter state bookmarkable and shareable.

---

## 10. Filtering Logic

Filtering happens server-side in the API route. The route handler builds a dynamic SQL `WHERE` clause:

```ts
const conditions: string[] = [];
const params: unknown[] = [];

if (filters.q) {
  conditions.push("(LOWER(title) LIKE ? OR LOWER(developer) LIKE ?)");
  const term = `%${filters.q.toLowerCase()}%`;
  params.push(term, term);
}
if (filters.platform) {
  conditions.push("platform = ?");
  params.push(filters.platform);
}
// ... etc.

const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
const rows = db
  .query(`SELECT * FROM games ${where} ORDER BY ${sortField} ${sortOrder}`)
  .all(...params);
```

---

## 11. Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start Next.js dev server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run scripts/seed.ts` | Seed database from JSON |
| `bun run scripts/seed.ts --reset` | Drop and re-seed |

---

## 12. Environment & Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./games.db` | Path to the SQLite file |
| `NEXT_PUBLIC_APP_TITLE` | `GameDB` | Shown in the page title and header |

Store in `.env.local` (gitignored).

---

## 13. Out of Scope (v1)

The following are deliberately excluded from this version:

- User authentication and accounts.
- User-submitted reviews or ratings.
- Adding / editing / deleting games via the UI (data is managed via JSON seed).
- Cover art / images.
- Pagination (acceptable at typical seed sizes; add if > ~500 entries).
- Wishlist or backlog tracking.
- Multi-platform entries (one row per platform per game).
