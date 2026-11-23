import { NextResponse } from "next/server";
import { dbPool } from "@/lib/auth";
import { cleanCmsText, getCmsActor, slugify } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const types = new Set(["page", "post", "programme", "story", "event"]);
const statuses = new Set(["draft", "review", "scheduled", "published", "archived"]);
const asObject = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const asBlocks = (value: unknown) => Array.isArray(value) ? value.slice(0, 100) : [];

export async function GET(request: Request) {
  const actor = await getCmsActor();
  if (!actor) return NextResponse.json({ error: "Your secure administrator session is required." }, { status: 401 });
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const entry = await dbPool.query("SELECT * FROM public.cms_entries WHERE id=$1", [id]);
      if (!entry.rowCount) return NextResponse.json({ error: "Content not found." }, { status: 404 });
      const revisions = await dbPool.query(
        "SELECT id, revision_note, created_by, created_at FROM public.cms_revisions WHERE entry_id=$1 ORDER BY created_at DESC LIMIT 30",
        [id]
      );
      return NextResponse.json({ entry: entry.rows[0], revisions: revisions.rows });
    }
    const type = url.searchParams.get("type") || "";
    const status = url.searchParams.get("status") || "";
    const q = cleanCmsText(url.searchParams.get("q"), 120);
    const values: unknown[] = [];
    const where: string[] = [];
    if (types.has(type)) { values.push(type); where.push("content_type=$" + values.length); }
    if (statuses.has(status)) { values.push(status); where.push("status=$" + values.length); }
    if (q) { values.push("%" + q + "%"); where.push("(title ILIKE $" + values.length + " OR slug ILIKE $" + values.length + " OR excerpt ILIKE $" + values.length + ")"); }
    const result = await dbPool.query(
      "SELECT id, content_type, slug, title, excerpt, status, featured_media_id, scheduled_at, published_at, created_at, updated_at FROM public.cms_entries " +
      (where.length ? "WHERE " + where.join(" AND ") : "") + " ORDER BY updated_at DESC LIMIT 250",
      values
    );
    const counts = await dbPool.query(
      "SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='published')::int AS published, COUNT(*) FILTER (WHERE status='draft')::int AS drafts, COUNT(*) FILTER (WHERE status='review')::int AS awaiting_review FROM public.cms_entries"
    );
    return NextResponse.json({ entries: result.rows, counts: counts.rows[0], actor });
  } catch (error) {
    console.error("CMS content listing failed", error);
    return NextResponse.json({ error: "The content workspace is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const actor = await getCmsActor();
  if (!actor) return NextResponse.json({ error: "Your secure administrator session is required." }, { status: 401 });
  try {
    const body = await request.json();
    const title = cleanCmsText(body.title, 180);
    const contentType = cleanCmsText(body.contentType, 24);
    if (!title || !types.has(contentType)) return NextResponse.json({ error: "A title and valid content type are required." }, { status: 400 });
    let status = statuses.has(body.status) ? body.status : "draft";
    if (actor.role !== "administrator" && status !== "draft") status = "review";
    const slug = slugify(cleanCmsText(body.slug, 120) || title);
    const result = await dbPool.query(
      "INSERT INTO public.cms_entries (content_type, slug, title, excerpt, content, status, featured_media_id, seo, scheduled_at, published_at, created_by, updated_by) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8::jsonb,$9,CASE WHEN $6='published' THEN now() ELSE NULL END,$10,$10) RETURNING *",
      [contentType, slug, title, cleanCmsText(body.excerpt, 500), JSON.stringify(asBlocks(body.content)), status, body.featuredMediaId || null, JSON.stringify(asObject(body.seo)), status === "scheduled" && body.scheduledAt ? new Date(body.scheduledAt) : null, actor.email]
    );
    await dbPool.query(
      "INSERT INTO public.cms_revisions (entry_id,snapshot,revision_note,created_by) VALUES ($1,$2::jsonb,'Initial draft',$3)",
      [result.rows[0].id, JSON.stringify(result.rows[0]), actor.email]
    );
    return NextResponse.json({ entry: result.rows[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("cms_entries_slug_key")) return NextResponse.json({ error: "That URL slug is already in use. Choose another." }, { status: 409 });
    console.error("CMS content creation failed", error);
    return NextResponse.json({ error: "Unable to create this content item." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const actor = await getCmsActor();
  if (!actor) return NextResponse.json({ error: "Your secure administrator session is required." }, { status: 401 });
  try {
    const body = await request.json();
    const id = cleanCmsText(body.id, 64);
    if (!id) return NextResponse.json({ error: "Content ID is required." }, { status: 400 });
    const current = await dbPool.query("SELECT * FROM public.cms_entries WHERE id=$1", [id]);
    if (!current.rowCount) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    const old = current.rows[0];
    let status = statuses.has(body.status) ? body.status : old.status;
    if (actor.role !== "administrator") status = status === "draft" ? "draft" : "review";
    const title = cleanCmsText(body.title ?? old.title, 180);
    const slug = slugify(cleanCmsText(body.slug ?? old.slug, 120) || title);
    const content = body.content === undefined ? old.content : asBlocks(body.content);
    const excerpt = body.excerpt === undefined ? old.excerpt : cleanCmsText(body.excerpt, 500);
    const seo = body.seo === undefined ? old.seo : asObject(body.seo);
    const featured = body.featuredMediaId === undefined ? old.featured_media_id : body.featuredMediaId || null;
    await dbPool.query(
      "INSERT INTO public.cms_revisions (entry_id,snapshot,revision_note,created_by) VALUES ($1,$2::jsonb,$3,$4)",
      [id, JSON.stringify(old), cleanCmsText(body.revisionNote, 180) || "Saved changes", actor.email]
    );
    const updated = await dbPool.query(
      "UPDATE public.cms_entries SET title=$2,slug=$3,excerpt=$4,content=$5::jsonb,status=$6,featured_media_id=$7,seo=$8::jsonb,scheduled_at=$9,published_at=CASE WHEN $6='published' THEN COALESCE(published_at,now()) ELSE NULL END,updated_by=$10,updated_at=now() WHERE id=$1 RETURNING *",
      [id, title, slug, excerpt, JSON.stringify(content), status, featured, JSON.stringify(seo), status === "scheduled" && body.scheduledAt ? new Date(body.scheduledAt) : old.scheduled_at, actor.email]
    );
    return NextResponse.json({ entry: updated.rows[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("cms_entries_slug_key")) return NextResponse.json({ error: "That URL slug is already in use. Choose another." }, { status: 409 });
    console.error("CMS content update failed", error);
    return NextResponse.json({ error: "Unable to save this content item." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const actor = await getCmsActor();
  if (!actor || actor.role !== "administrator") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  try {
    const body = await request.json();
    const result = await dbPool.query("UPDATE public.cms_entries SET status='archived',updated_by=$2,updated_at=now() WHERE id=$1 RETURNING id", [cleanCmsText(body.id,64),actor.email]);
    if (!result.rowCount) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to archive this content item." }, { status: 500 });
  }
}
