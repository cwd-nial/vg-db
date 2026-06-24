# GameDB

A video game catalog — think IMDb for games. Browse, search, and filter games across PS5, Xbox, and Switch. No login required.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Next.js 16.2.9 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Validation | Zod v4 |
| Database | SQLite via `bun:sqlite` |

## Getting started

```bash
# Install dependencies
bun install

# Seed the database
bun run scripts/seed.ts

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
bun run dev                       # Dev server
bun run build                     # Production build
bun run start                     # Start production server
bun run lint                      # ESLint
bun run scripts/seed.ts           # Seed DB from data/games.json
bun run scripts/seed.ts --reset   # Drop and re-seed
```

## Environment

Create `.env.local` (gitignored):

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
NEXT_PUBLIC_APP_TITLE=GameDB      # shown in header/title
```

## Project structure

```
app/
  page.tsx                # Main browse page
  layout.tsx
  api/games/
    route.ts              # GET /api/games
    years/route.ts        # GET /api/games/years
components/
  FilterBar.tsx           # Search, platform, score, year, sort controls
  GameCard.tsx            # Individual game card with Metacritic badge
  GameGrid.tsx            # Responsive 1→2→3→4 column grid
lib/
  db.ts                   # SQLite singleton (bun:sqlite)
  queries.ts              # Prepared-statement query helpers
  types.ts                # Shared TypeScript types
scripts/
  seed.ts                 # JSON → SQLite seeder
data/
  games.json              # Seed data
```

## API

### `GET /api/games`

| Param | Type | Description |
|---|---|---|
| `q` | string | Case-insensitive match on title + developer |
| `platform` | `PS5` \| `Xbox` \| `Switch` | Exact match |
| `metacritic_min` | number | Min score (inclusive) |
| `metacritic_max` | number | Max score (inclusive) |
| `release_year` | number | Exact year |
| `sort` | `title` \| `release_year` \| `metacritic_score` | Sort field |
| `order` | `asc` \| `desc` | Sort direction |

Response: `{ data: Game[], total: number }`

### `GET /api/games/years`

Returns distinct release years in descending order.

Response: `{ years: number[] }`

## Data model

```ts
interface Game {
  id: number;
  title: string;
  developer: string;
  platform: "PS5" | "Xbox" | "Switch";
  description: string;
  metacritic_score: number | null;  // 0–100
  metacritic_url: string | null;
  release_year: number;
}
```

Games are unique per `(title, platform)`. To add games, edit `data/games.json` and re-seed.

## Out of scope (v1)

Auth, user reviews, cover art, pagination, wishlist tracking, and UI-based game management are all intentionally excluded.
