import type { NextRequest } from "next/server";
import { QueryParamsSchema } from "@/lib/types";
import { queryGames } from "@/lib/queries";

export async function GET(request: NextRequest): Promise<Response> {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = QueryParamsSchema.safeParse(raw);

  if (!result.success) {
    return Response.json(
      { error: result.error.issues[0]?.message ?? "Invalid query parameters" },
      { status: 400 }
    );
  }

  const { games, total } = await queryGames(result.data);
  return Response.json({ data: games, total });
}