import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, dbPool } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin-login");
  const email = session.user.email.toLowerCase();
  const isAdministrator = email === "r1cfprojects@gmail.com" && session.user.role === "admin";
  if (!isAdministrator) {
    const member = await dbPool.query(
      "SELECT email FROM public.cms_team_members WHERE email=$1 AND is_active=true",
      [email]
    );
    if (!member.rowCount) redirect("/admin-unauthorized");
  }
  if (!session.user.twoFactorEnabled) redirect("/admin-2fa-setup");
  return children;
}
