import type { APIRoute } from "astro";
import { getBookedDatesInRange } from "~/lib/availability";

/**
 * GET /api/apartments/:id/availability?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns booked dates for an apartment within a date range.
 * This endpoint is NOT cached — always fresh availability data.
 */
export const GET: APIRoute = async ({ params, url, locals }) => {
  const apartmentId = params.id;
  if (!apartmentId) {
    return new Response(JSON.stringify({ error: "Missing apartment ID" }), {
      status: 400,
      headers: jsonHeaders(),
    });
  }

  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");

  if (!start || !end) {
    return new Response(JSON.stringify({ error: "start and end query params required" }), {
      status: 400,
      headers: jsonHeaders(),
    });
  }

  const env = (locals as { runtime: { env: Record<string, unknown> } }).runtime.env;
  const db = env.DB as D1Database;

  // Query availability blocks from D1
  const result = await db
    .prepare(
      "SELECT id, apartment_id, check_in, check_out FROM availability_blocks WHERE apartment_id = ? AND check_in < ? AND check_out > ?",
    )
    .bind(apartmentId, end, start)
    .all<{ id: string; apartment_id: string; check_in: string; check_out: string }>();

  const blocks = (result.results ?? []).map((row) => ({
    id: row.id,
    apartmentId: row.apartment_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
  }));

  const bookedDates = getBookedDatesInRange(blocks, start, end);

  return new Response(
    JSON.stringify({ bookedDates, blocks: blocks.length }),
    {
      headers: {
        ...jsonHeaders(),
        "Cache-Control": "private, no-store",
      },
    },
  );
};

function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json" };
}
