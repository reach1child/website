import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { dbPool } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const expectedEmail = "r1cfprojects@gmail.com";
  const origin = request.headers.get("origin");
  if (!expectedToken || origin !== "https://reachonechildfoundation.org") {
    return Response.json({ message: "Bootstrap is unavailable." }, { status: 403 });
  }

  let body: { token?: string; name?: string; password?: string };
  try { body = await request.json(); } catch { return Response.json({ message: "Invalid request." }, { status: 400 }); }
  if (!body.token || !safeEqual(body.token, expectedToken)) {
    return Response.json({ message: "Invalid or expired setup invitation." }, { status: 403 });
  }
  if (!body.name?.trim() || !body.password || body.password.length < 14 || body.password.length > 128) {
    return Response.json({ message: "Use a name and a password between 14 and 128 characters." }, { status: 400 });
  }

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('r1cf-first-admin-bootstrap'))");
    const count = await client.query('SELECT COUNT(*)::int AS count FROM "user"');
    if (count.rows[0].count !== 0) {
      await client.query("ROLLBACK");
      return Response.json({ message: "The initial setup has already been completed." }, { status: 409 });
    }

    const result = await auth.api.signUpEmail({
      body: { name: body.name.trim(), email: expectedEmail, password: body.password },
    });
    if (!result?.user?.id) {
      await client.query("ROLLBACK");
      return Response.json({ message: "The administrator account could not be created." }, { status: 400 });
    }
    await client.query('UPDATE "user" SET role = $1, "emailVerified" = TRUE WHERE id = $2', ["admin", result.user.id]);
    await client.query("COMMIT");
    return Response.json({ success: true, message: "Initial administrator created. Sign in and complete authenticator setup." });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return Response.json({ message: "Initial setup could not be completed. No password has been emailed or stored in plain text." }, { status: 500 });
  } finally {
    client.release();
  }
}
