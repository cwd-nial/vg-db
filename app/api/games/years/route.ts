import { queryYears } from "@/lib/queries";

export async function GET(): Promise<Response> {
  return Response.json({ years: await queryYears() });
}