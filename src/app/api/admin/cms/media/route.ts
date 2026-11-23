import { NextResponse } from "next/server";
import { dbPool } from "@/lib/auth";
import { cleanCmsText, getCmsActor } from "@/lib/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const allowed = new Set(["image/jpeg","image/png","image/webp","image/gif"]);

export async function GET(request: Request) {
  const actor = await getCmsActor();
  if (!actor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const folder = new URL(request.url).searchParams.get("folder") || "";
    const values: string[] = [];
    let where = "";
    if (folder) { values.push(folder); where = "WHERE folder=$1"; }
    const result = await dbPool.query(
      "SELECT id,filename,mime_type,byte_size,alt_text,folder,created_at FROM public.cms_media " + where + " ORDER BY created_at DESC LIMIT 300",
      values
    );
    const folders = await dbPool.query("SELECT DISTINCT folder FROM public.cms_media ORDER BY folder");
    return NextResponse.json({ media: result.rows, folders: folders.rows.map(row => row.folder) });
  } catch (error) {
    console.error("CMS media listing failed", error);
    return NextResponse.json({ error: "The media library is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const actor = await getCmsActor();
  if (!actor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!allowed.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 415 });
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Images must be 4 MB or smaller. Resize large photographs before uploading." }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const folder = cleanCmsText(form.get("folder"), 80) || "Uncategorised";
    const alt = cleanCmsText(form.get("altText"), 240);
    const result = await dbPool.query(
      "INSERT INTO public.cms_media (filename,mime_type,byte_size,data,alt_text,folder,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,filename,mime_type,byte_size,alt_text,folder,created_at",
      [file.name.replace(/[\\/]/g,"").slice(0,180),file.type,file.size,bytes,alt,folder,actor.email]
    );
    return NextResponse.json({ media: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("CMS image upload failed", error);
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const actor = await getCmsActor();
  if (!actor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await request.json();
    const id = cleanCmsText(body.id, 64);
    const result = await dbPool.query(
      "UPDATE public.cms_media SET alt_text=$2,folder=$3 WHERE id=$1 RETURNING id,filename,mime_type,byte_size,alt_text,folder,created_at",
      [id,cleanCmsText(body.altText,240),cleanCmsText(body.folder,80) || "Uncategorised"]
    );
    if (!result.rowCount) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    return NextResponse.json({ media: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Unable to update image details." }, { status: 500 });
  }
}
