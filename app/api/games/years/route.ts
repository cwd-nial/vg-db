import { queryYears } from "@/lib/queries";

export function GET(): Response {
  return Response.json({ years: queryYears() });
}
