import type { APIRoute } from "astro";
import { env as _env } from "cloudflare:workers";
import type { Env } from "~/env";
const env = _env as unknown as Env;

/**
 * Image serving route: fetches from private R2 bucket.
 * URL: /api/img/:key (key is a UUID without extension)
 */
export const GET: APIRoute = async ({ params }) => {
  const key = params.key ?? "";

  if (!key || key.includes("..") || key.startsWith("/")) {
    return new Response("Invalid key", { status: 400 });
  }

  const bucket = env.MEDIA;
  if (!bucket) {
    return new Response("Storage not configured", { status: 503 });
  }

  try {
    const object = await bucket.get(key);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers({
      "Cache-Control": "public, max-age=31536000, immutable",
    });

    if (object.httpMetadata?.contentType) {
      headers.set("Content-Type", object.httpMetadata.contentType);
    }

    return new Response(object.body, { headers });
  } catch {
    return new Response("Internal error", { status: 500 });
  }
};
