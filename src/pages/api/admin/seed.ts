import type { APIRoute } from "astro";
import { applySeed } from "emdash/seed";
import { getDb } from "emdash";
import seedData from "../../../../seed/seed.json";

/**
 * POST /api/admin/seed
 *
 * One-shot endpoint to seed all Emdash collections with preloaded content.
 * Requires admin authentication. Idempotent — safe to run multiple times.
 */
export const POST: APIRoute = async ({ locals }) => {
  try {
    const db = await getDb();
    const result = await applySeed(db, seedData as Parameters<typeof applySeed>[1]);

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
