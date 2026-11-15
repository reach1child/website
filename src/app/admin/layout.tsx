import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin-login");
  const email = session.user.email.toLowerCase();
  if (email !== "r1cfprojects@gmail.com" || session.user.role !== "admin") {
    redirect("/admin-unauthorized");
  }
  if (!session.user.twoFactorEnabled) redirect("/admin-2fa-setup");
  return children;
}
