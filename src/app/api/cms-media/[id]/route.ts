import { NextResponse } from "next/server";
import { dbPool } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  try {
    const result = await dbPool.query("SELECT mime_type,data,filename FROM public.cms_media WHERE id=$1", [id]);
    if (!result.rowCount) return new Response("Not found", { status: 404 });
    const item = result.rows[0];
    const bytes = new Uint8Array(item.data);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": item.mime_type,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": "inline; filename*=UTF-8''" + encodeURIComponent(item.filename),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Media unavailable", { status: 503 });
  }
}
