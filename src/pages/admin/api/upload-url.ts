import type { APIRoute } from "astro";
import { AwsClient } from "aws4fetch";

/**
 * POST /admin/api/upload-url
 * Generate a presigned PUT URL for direct browser-to-R2 upload.
 * Requires authenticated admin session.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime: { env: Record<string, unknown> } }).runtime.env;
  const accessKeyId = env.R2_ACCESS_KEY_ID as string | undefined;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY as string | undefined;
  const accountId = "eac400a0a3a3638c7c91fe2e7875756d";

  if (!accessKeyId || !secretAccessKey) {
    return new Response(JSON.stringify({ error: "R2 credentials not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json().catch(() => null) as { filename?: string; contentType?: string } | null;

  if (!body?.filename) {
    return new Response(JSON.stringify({ error: "Filename required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate opaque UUID key
  const key = crypto.randomUUID();
  const extension = body.filename.split(".").pop()?.toLowerCase() ?? "";
  const objectKey = extension ? `${key}.${extension}` : key;

  const r2Client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/apartmani-media/${objectKey}`;

  const signed = await r2Client.sign(url, {
    method: "PUT",
    headers: {
      "Content-Type": body.contentType ?? "application/octet-stream",
    },
  });

  return new Response(
    JSON.stringify({
      presignedUrl: signed.url,
      key: objectKey,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
