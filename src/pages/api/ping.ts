import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as unknown as Record<string, unknown>).runtime as
    | { env?: Record<string, unknown> }
    | undefined;

  const hasMedia = !!runtime?.env?.MEDIA;
  const bindings = runtime?.env ? Object.keys(runtime.env).join(", ") : "none";

  return new Response(JSON.stringify({ ok: true, hasMedia, bindings }), {
    headers: { "Content-Type": "application/json" },
  });
};
