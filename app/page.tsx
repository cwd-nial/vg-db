import { QueryParamsSchema, DEFAULT_FILTERS } from "@/lib/types";
import type { FilterState } from "@/lib/types";
import { queryGames, queryYears } from "@/lib/queries";
import { FilterBar } from "@/components/FilterBar";
import { GameGrid } from "@/components/GameGrid";

type SearchParamsProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function flattenParam(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

export default async function Page({ searchParams }: SearchParamsProps) {
  const raw = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, flattenParam(v)])
  );

  const parsed = QueryParamsSchema.safeParse(flat);
  const qp = parsed.success
    ? parsed.data
    : { sort: "title" as const, order: "asc" as const };

  const currentFilters: FilterState = {
    q: flat.q ?? "",
    platform: (flat.platform as FilterState["platform"]) ?? "",
    metacritic_min: qp.metacritic_min ?? DEFAULT_FILTERS.metacritic_min,
    metacritic_max: qp.metacritic_max ?? DEFAULT_FILTERS.metacritic_max,
    release_year: flat.release_year ?? "",
    sort: qp.sort,
    order: qp.order,
  };

  const { games, total } = queryGames(qp);
  const years = queryYears();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">GameDB</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Browse and discover video games
        </p>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-8">
        <FilterBar filters={currentFilters} years={years} />

        <p className="mb-4 mt-6 text-sm text-gray-500">
          {total === 1 ? "1 game" : `${total} games`}
        </p>

        <GameGrid games={games} />
      </main>
    </div>
  );
}
