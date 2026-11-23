import { headers } from "next/headers";
import { auth, dbPool } from "@/lib/auth";

export type CmsRole = "administrator" | "editor" | "author";
export type CmsActor = { email: string; name: string; role: CmsRole };

export async function getCmsActor(): Promise<CmsActor | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.twoFactorEnabled) return null;
  const email = session.user.email.toLowerCase();
  if (email === "r1cfprojects@gmail.com" && session.user.role === "admin") {
    return { email, name: session.user.name || "Administrator", role: "administrator" };
  }
  const result = await dbPool.query(
    "SELECT display_name, access_role FROM public.cms_team_members WHERE email = $1 AND is_active = true",
    [email]
  );
  const member = result.rows[0];
  if (!member) return null;
  return {
    email,
    name: member.display_name || session.user.name || email,
    role: member.access_role === "editor" ? "editor" : "author",
  };
}

export function cleanCmsText(value: unknown, max = 2000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function slugify(value: string): string {
  return value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "untitled";
}

export async function publishDueCmsEntries(): Promise<void> {
  await dbPool.query("UPDATE public.cms_entries SET status='published', published_at=COALESCE(scheduled_at,now()), updated_at=now() WHERE status='scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= now()");
}

const cmsBlockTypes = new Set(["heading","paragraph","image","quote","button","divider","list"]);
function safeCmsUrl(value: unknown): string {
  const url = cleanCmsText(value, 1200);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^https:\/\//i.test(url) || /^(mailto|tel):/i.test(url)) return url;
  return "";
}
export function cleanCmsBlocks(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const block = raw as Record<string, unknown>;
    const type = cleanCmsText(block.type, 20);
    if (!cmsBlockTypes.has(type)) return [];
    const result: Record<string, unknown> = { id: cleanCmsText(block.id, 80) || "block-" + index, type };
    if (typeof block.text === "string") result.text = cleanCmsText(block.text, 12000);
    if (type === "image" || type === "button") result.url = safeCmsUrl(block.url);
    if (type === "image") {
      result.alt = cleanCmsText(block.alt, 240);
      result.caption = cleanCmsText(block.caption, 500);
      if (block.isFeatured === true) result.isFeatured = true;
    }
    if (type === "heading") result.level = [2,3,4].includes(Number(block.level)) ? Number(block.level) : 2;
    return [result];
  });
}
