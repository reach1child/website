import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHmac } from "node:crypto";
import { Pool } from "pg";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const formTypes = new Set(["sponsor", "partner", "volunteer", "general"]);
const clean = (value: unknown, max = 2000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

let formsPool: Pool | null = null;
function getFormsPool() {
  const connectionString = process.env.FORM_SUBMISSIONS_DATABASE_URL;
  if (!connectionString) throw new Error("Restricted form database connection is not configured.");
  if (!formsPool) {
    formsPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
  }
  return formsPool;
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email.toLowerCase() !== "r1cfprojects@gmail.com" ||
      session.user.role !== "admin" || !session.user.twoFactorEnabled) return null;
  return session;
}

async function enforceSubmissionLimit(request: Request, pool: Pool) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("Rate-limit signing secret is not configured.");
  const forwarded = request.headers.get("x-real-ip") || "unknown";
  const ipHash = createHmac("sha256", secret).update(forwarded).digest("hex");
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / 900_000) * 900_000);
  const result = await pool.query(
    `INSERT INTO app_private.form_rate_limits (ip_hash, window_start, request_count)
     VALUES ($1, $2, 1)
     ON CONFLICT (ip_hash, window_start)
     DO UPDATE SET request_count = app_private.form_rate_limits.request_count + 1
     RETURNING request_count`,
    [ipHash, windowStart]
  );
  return Number(result.rows[0]?.request_count || 0) <= 5;
}

export async function POST(request: Request) {
  try {
    const pool = getFormsPool();
    const allowed = await enforceSubmissionLimit(request, pool);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a little while and try again." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
    const body = await request.json();
    const formType = clean(body.formType, 32);
    const formTitle = clean(body.formTitle, 120);
    const name = clean(body.name, 160);
    const email = clean(body.email, 254).toLowerCase();
    if (!formTypes.has(formType) || !formTitle || !name ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
    }
    const result = await pool.query(
      `INSERT INTO app_private.form_submissions
       (form_type, form_title, name, email, phone, organisation, location, interest, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [formType, formTitle, name, email, clean(body.phone, 80) || null,
       clean(body.organisation, 180) || null, clean(body.location, 180) || null,
       clean(body.interest, 240) || null, clean(body.message, 5000) || null]
    );
    return NextResponse.json({ ok: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Form submission failed", error);
    const missingConfig = error instanceof Error &&
      error.message === "Restricted form database connection is not configured.";
    return NextResponse.json(
      { error: missingConfig ? "Form submissions are temporarily unavailable." : "We could not submit your form right now. Please try again." },
      { status: missingConfig ? 503 : 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const pool = getFormsPool();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";
    const search = (searchParams.get("q") || "").trim().slice(0, 120);
    const status = searchParams.get("status") || "";
    const values: unknown[] = [];
    const where: string[] = [];
    if (type && formTypes.has(type)) { values.push(type); where.push(`form_type = $${values.length}`); }
    if (status && ["new", "reviewing", "resolved"].includes(status)) { values.push(status); where.push(`status = $${values.length}`); }
    if (search) {
      values.push(`%${search}%`);
      where.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length} OR organisation ILIKE $${values.length} OR message ILIKE $${values.length})`);
    }
    const result = await pool.query(
      `SELECT id, form_type, form_title, name, email, phone, organisation, location, interest, message, status, created_at
       FROM app_private.form_submissions ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY created_at DESC LIMIT 250`, values
    );
    return NextResponse.json({ submissions: result.rows });
  } catch (error) {
    console.error("Unable to load form submissions", error);
    return NextResponse.json({ error: "The submissions inbox is temporarily unavailable." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = await request.json();
  const id = clean(body.id, 64);
  const status = clean(body.status, 20);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["new", "reviewing", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid submission update." }, { status: 400 });
  }
  try {
    const result = await getFormsPool().query(
      "UPDATE app_private.form_submissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id",
      [status, id]
    );
    if (!result.rowCount) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to update form submission", error);
    return NextResponse.json({ error: "The submission could not be updated." }, { status: 503 });
  }
}
