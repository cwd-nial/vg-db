"use client";

import { useState } from "react";
import type { Game, Platform } from "@/lib/types";

type Props = { game: Game };

const PLATFORM_STYLES: Record<Platform, string> = {
  PS5: "bg-blue-100 text-blue-700",
  Xbox: "bg-green-100 text-green-700",
  Switch: "bg-red-100 text-red-700",
};

function metacriticBadgeStyle(score: number | null): string {
  if (score === null) return "bg-gray-200 text-gray-500";
  if (score >= 75) return "bg-green-500 text-white";
  if (score >= 50) return "bg-yellow-400 text-white";
  return "bg-red-500 text-white";
}

export function GameCard({ game }: Props): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  function handleToggleDescription() {
    setExpanded((prev) => !prev);
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLATFORM_STYLES[game.platform]}`}
        >
          {game.platform}
        </span>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${metacriticBadgeStyle(game.metacritic_score)}`}
          aria-label={
            game.metacritic_score !== null
              ? `Metacritic score: ${game.metacritic_score}`
              : "Not yet scored"
          }
        >
          {game.metacritic_score ?? "N/A"}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold leading-snug text-gray-900">
          {game.title}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">
          {game.developer} &middot; {game.release_year}
        </p>
      </div>

      <div>
        <p
          className={`text-sm leading-relaxed text-gray-700 ${expanded ? "" : "line-clamp-3"}`}
        >
          {game.description}
        </p>
        <button
          type="button"
          onClick={handleToggleDescription}
          className="mt-1 text-xs font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>

      {game.metacritic_url && (
        <a
          href={game.metacritic_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          View on Metacritic
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-3"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.75 3a.75.75 0 0 0 0 1.5h4.19L3.22 10.22a.75.75 0 1 0 1.06 1.06l5.72-5.72v4.19a.75.75 0 0 0 1.5 0V3.75A.75.75 0 0 0 11 3H4.75Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      )}
    </article>
  );
}
