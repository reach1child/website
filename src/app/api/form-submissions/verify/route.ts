import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | null = null;
function getPool() {
  const connectionString = process.env.FORM_SUBMISSIONS_DATABASE_URL;
  if (!connectionString) throw new Error("Form database is not configured.");
  if (!pool) pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 8_000 });
  return pool;
}

export async function POST(request: Request) {
  const client = await getPool().connect().catch(() => null);
  if (!client) return NextResponse.json({ error: "Verification is temporarily unavailable. Please try again." }, { status: 503 });
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    if (!/^[a-f0-9]{64}$/i.test(token)) return NextResponse.json({ error: "This verification link is invalid." }, { status: 400 });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await client.query("BEGIN");
    const pending = await client.query(
      "SELECT payload FROM app_private.form_submission_verifications WHERE token_hash = $1 AND expires_at > NOW() FOR UPDATE",
      [tokenHash]
    );
    if (!pending.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "This verification link has expired or has already been used. Please submit the form again." }, { status: 400 });
    }
    const p = pending.rows[0].payload;
    const inserted = await client.query(
      `INSERT INTO app_private.form_submissions
       (form_type, form_title, name, email, phone, organisation, location, interest, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [p.formType, p.formTitle, p.name, p.email, p.phone, p.organisation, p.location, p.interest, p.message]
    );
    await client.query("DELETE FROM app_private.form_submission_verifications WHERE token_hash = $1", [tokenHash]);
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, id: inserted.rows[0].id });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Email verification failed", error);
    return NextResponse.json({ error: "We could not complete verification. Please try again." }, { status: 500 });
  } finally {
    client.release();
  }
}
