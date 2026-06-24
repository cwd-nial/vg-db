import { z } from "zod";

export type Platform = "PS5" | "Xbox" | "Switch";

export type SortField = "title" | "release_year" | "metacritic_score";

export type SortOrder = "asc" | "desc";

export type Game = {
  id: number;
  title: string;
  developer: string;
  platform: Platform;
  description: string;
  metacritic_score: number | null;
  metacritic_url: string | null;
  release_year: number;
};

export type FilterState = {
  q: string;
  platform: Platform | "";
  metacritic_min: number;
  metacritic_max: number;
  release_year: string;
  sort: SortField;
  order: SortOrder;
};

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  platform: "",
  metacritic_min: 0,
  metacritic_max: 100,
  release_year: "",
  sort: "title",
  order: "asc",
};

export const QueryParamsSchema = z.object({
  q: z.string().optional(),
  platform: z.enum(["PS5", "Xbox", "Switch"]).optional(),
  metacritic_min: z.coerce.number().int().min(0).max(100).optional(),
  metacritic_max: z.coerce.number().int().min(0).max(100).optional(),
  release_year: z.coerce.number().int().optional(),
  sort: z.enum(["title", "release_year", "metacritic_score"]).default("title"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type QueryParams = z.infer<typeof QueryParamsSchema>;
