# CLAUDE.md

We are building the app described in @SPEC.md. Read that file for general architectural tasks or do double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun run dev              # Start Next.js dev server
bun run build            # Production build
bun run start            # Start production server
bun run lint             # ESLint
bun run scripts/seed.ts          # Seed DB from data/games.json
bun run scripts/seed.ts --reset  # Drop and re-seed
```

## Stack

- **Runtime**: Bun (not Node — use `bun:sqlite` for the DB, `bun` CLI for scripts)
- **Framework**: Next.js 16.2.9, App Router — see `node_modules/next/dist/docs/` for this version's API
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (PostCSS-based; config differs from v3 — no `tailwind.config.js`, configured via `postcss.config.mjs`)
- **Validation**: Zod v4 (breaking changes from v3)
- **Database**: SQLite via `bun:sqlite` (built-in, no external driver)

## Architecture

This is a video game catalog (SPEC.md describes the full design). The app is currently at the boilerplate stage — SPEC.md is the source of truth for what to build.

**Data flow**: `data/games.json` → `scripts/seed.ts` → `games.db` (SQLite) → `app/api/games/route.ts` → client `fetch` in `app/page.tsx`

**Key conventions from the spec:**
- All DB queries use raw SQL with prepared statements (`db.query(...).all(...params)`) — no ORM
- `lib/db.ts` exports a singleton `Database` instance; `DATABASE_PATH` env var controls the file path (default `./games.db`)
- Filtering is server-side only — `GET /api/games` builds a dynamic `WHERE` clause from query params
- Client state (filters) is mirrored to URL search params for shareability
- No auth, no pagination (until > ~500 entries), no cover art — intentionally out of scope for v1
