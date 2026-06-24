"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { FilterState } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";

type Props = {
  filters: FilterState;
  years: number[];
};

export function FilterBar({ filters, years }: Props): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState(filters.q);

  // Always-current ref so debounced navigate() never sees stale filters
  const latestFilters = useRef(filters);
  latestFilters.current = filters;

  // Sync search input when filters are reset externally
  useEffect(() => {
    setInputValue(filters.q);
  }, [filters.q]);

  function buildUrl(updates: Partial<FilterState>): string {
    const f = { ...latestFilters.current, ...updates };
    const params = new URLSearchParams();
    if (f.q) params.set("q", f.q);
    if (f.platform) params.set("platform", f.platform);
    if (f.metacritic_min > DEFAULT_FILTERS.metacritic_min)
      params.set("metacritic_min", String(f.metacritic_min));
    if (f.metacritic_max < DEFAULT_FILTERS.metacritic_max)
      params.set("metacritic_max", String(f.metacritic_max));
    if (f.release_year) params.set("release_year", f.release_year);
    if (f.sort !== DEFAULT_FILTERS.sort) params.set("sort", f.sort);
    if (f.order !== DEFAULT_FILTERS.order) params.set("order", f.order);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(updates: Partial<FilterState>) {
    router.replace(buildUrl(updates), { scroll: false });
  }

  // Debounce search — only depends on inputValue; navigate() reads latestFilters.current
  useEffect(() => {
    const timer = setTimeout(() => navigate({ q: inputValue }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  function handlePlatformChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate({ platform: e.target.value as FilterState["platform"] });
  }

  function handleMetacriticMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    navigate({ metacritic_min: Math.min(val, latestFilters.current.metacritic_max) });
  }

  function handleMetacriticMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    navigate({ metacritic_max: Math.max(val, latestFilters.current.metacritic_min) });
  }

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate({ release_year: e.target.value });
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigate({ sort: e.target.value as FilterState["sort"] });
  }

  function handleOrderToggle() {
    navigate({ order: filters.order === "asc" ? "desc" : "asc" });
  }

  function handleReset() {
    setInputValue("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <section
      aria-label="Filter games"
      className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
    >
      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-48 flex-1 flex-col gap-1">
          <label htmlFor="search" className="text-xs font-medium text-gray-500">
            Search
          </label>
          <input
            id="search"
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Title or developer…"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="platform" className="text-xs font-medium text-gray-500">
            Platform
          </label>
          <select
            id="platform"
            value={filters.platform}
            onChange={handlePlatformChange}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="">All platforms</option>
            <option value="PS5">PS5</option>
            <option value="Xbox">Xbox</option>
            <option value="Switch">Switch</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="year" className="text-xs font-medium text-gray-500">
            Year
          </label>
          <select
            id="year"
            value={filters.release_year}
            onChange={handleYearChange}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">
            Metacritic: {filters.metacritic_min}–{filters.metacritic_max}
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="metacritic-min" className="sr-only">
              Minimum Metacritic score
            </label>
            <input
              id="metacritic-min"
              type="range"
              min={0}
              max={100}
              value={filters.metacritic_min}
              onChange={handleMetacriticMinChange}
              className="w-24 accent-blue-600"
            />
            <label htmlFor="metacritic-max" className="sr-only">
              Maximum Metacritic score
            </label>
            <input
              id="metacritic-max"
              type="range"
              min={0}
              max={100}
              value={filters.metacritic_max}
              onChange={handleMetacriticMaxChange}
              className="w-24 accent-blue-600"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sort" className="text-xs font-medium text-gray-500">
            Sort
          </label>
          <div className="flex gap-2">
            <select
              id="sort"
              value={filters.sort}
              onChange={handleSortChange}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="title">Title</option>
              <option value="release_year">Year</option>
              <option value="metacritic_score">Score</option>
            </select>
            <button
              type="button"
              onClick={handleOrderToggle}
              aria-label={
                filters.order === "asc"
                  ? "Sort ascending — click to reverse"
                  : "Sort descending — click to reverse"
              }
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {filters.order === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
