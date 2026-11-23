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
