import { GameGrid } from "@/components/GameGrid";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">GameDB</h1>
        <p className="mt-0.5 text-sm text-gray-500">Browse and discover video games</p>
      </header>
      <main className="mx-auto max-w-screen-xl px-6 py-8">
        <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        <div className="mt-6 mb-4 h-4 w-20 animate-pulse rounded bg-gray-200" />
        <GameGrid games={[]} loading={true} />
      </main>
    </div>
  );
}
