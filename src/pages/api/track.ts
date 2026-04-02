import type { APIRoute } from "astro";

const validEventTypes = [
  "inquiry_submit",
  "question_submit",
  "whatsapp_click",
  "call_click",
  "apartment_view",
  "gallery_open",
  "language_switch",
  "calendar_select",
] as const;

/**
 * POST /api/track
 * Cookieless analytics event tracking. Writes to D1 events table.
 * No PII stored — only event type, apartment slug, locale, timestamp, page path.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime: { env: Record<string, unknown> } }).runtime.env;
  const db = env.DB as D1Database;

  const body = await request.json().catch(() => null) as {
    type?: string;
    apartmentSlug?: string;
    locale?: string;
    pagePath?: string;
  } | null;

  if (!body?.type || !validEventTypes.includes(body.type as (typeof validEventTypes)[number])) {
    return new Response(JSON.stringify({ error: "Invalid event type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await db
    .prepare("INSERT INTO events (type, apartment_slug, locale, page_path) VALUES (?, ?, ?, ?)")
    .bind(body.type, body.apartmentSlug ?? null, body.locale ?? null, body.pagePath ?? null)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
};
