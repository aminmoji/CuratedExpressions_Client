import { env } from "cloudflare:workers";

type RouteProps = { params: Promise<{ key: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  const { key } = await params;
  if (!key.startsWith("artwork-") || !env.BUCKET) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.BUCKET.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
