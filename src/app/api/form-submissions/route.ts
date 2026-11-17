import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { Pool } from "pg";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const formTypes = new Set(["sponsor", "partner", "volunteer", "general", "donate"]);
const clean = (value: unknown, max = 2000) => typeof value === "string" ? value.trim().slice(0, max) : "";

let formsPool: Pool | null = null;
function getFormsPool() {
  const connectionString = process.env.FORM_SUBMISSIONS_DATABASE_URL;
  if (!connectionString) throw new Error("Restricted form database connection is not configured.");
  if (!formsPool) formsPool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 8_000 });
  return formsPool;
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email.toLowerCase() !== "r1cfprojects@gmail.com" || session.user.role !== "admin" || !session.user.twoFactorEnabled) return null;
  return session;
}

async function enforceSubmissionLimit(request: Request, pool: Pool) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("Rate-limit signing secret is not configured.");
  const forwarded = request.headers.get("x-real-ip") || "unknown";
  const ipHash = createHmac("sha256", secret).update(forwarded).digest("hex");
  const windowStart = new Date(Math.floor(Date.now() / 900_000) * 900_000);
  const result = await pool.query(
    `INSERT INTO app_private.form_rate_limits (ip_hash, window_start, request_count)
     VALUES ($1, $2, 1) ON CONFLICT (ip_hash, window_start)
     DO UPDATE SET request_count = app_private.form_rate_limits.request_count + 1 RETURNING request_count`,
    [ipHash, windowStart]
  );
  return Number(result.rows[0]?.request_count || 0) <= 5;
}

export async function POST(request: Request) {
  try {
    const pool = getFormsPool();
    if (!(await enforceSubmissionLimit(request, pool))) {
      return NextResponse.json({ error: "Too many attempts. Please wait a little while and try again." }, { status: 429, headers: { "Retry-After": "900" } });
    }
    const body = await request.json();
    const formType = clean(body.formType, 32);
    const formTitle = clean(body.formTitle, 120);
    const name = clean(body.name, 160);
    const email = clean(body.email, 254).toLowerCase();
    if (!formTypes.has(formType) || !formTitle || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (formType === "donate" && !clean(body.interest, 240))) {
      return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const payload = {
      formType, formTitle, name, email,
      phone: clean(body.phone, 80) || null,
      organisation: clean(body.organisation, 180) || null,
      location: clean(body.location, 180) || null,
      interest: clean(body.interest, 240) || null,
      message: clean(body.message, 5000) || null,
    };
    await pool.query("DELETE FROM app_private.form_submission_verifications WHERE expires_at < NOW()");
    await pool.query(
      `INSERT INTO app_private.form_submission_verifications (token_hash, payload, email, expires_at)
       VALUES ($1, $2::jsonb, $3, NOW() + INTERVAL '24 hours')`,
      [tokenHash, JSON.stringify(payload), email]
    );

    const origin = new URL(request.url).origin;
    const verifyUrl = `${origin}/verify-submission?token=${token}`;
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Reach One Child Foundation <noreply@reachonechildfoundation.org>",
        to: [email],
        subject: "Please verify your email address",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033;line-height:1.6"><h2 style="color:#041968">Verify your email address</h2><p>Hello ${name.replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c] || c))},</p><p>Thank you for contacting Reach One Child Foundation. Please confirm that this email address belongs to you by clicking the button below. We will only receive your enquiry after you verify.</p><p style="margin:28px 0"><a href="${verifyUrl}" style="background:#041968;color:#fff;padding:14px 22px;text-decoration:none;border-radius:6px;font-weight:bold">Verify my email</a></p><p>This link expires in 24 hours. If you did not submit this enquiry, you can ignore this email.</p><p>Reach One Child Foundation<br/>Lusaka, Zambia</p></div>`,
      }),
    });
    if (!resendResponse.ok) {
      await pool.query("DELETE FROM app_private.form_submission_verifications WHERE token_hash = $1", [tokenHash]);
      const detail = await resendResponse.text();
      console.error("Verification email could not be sent", detail);
      return NextResponse.json({ error: "We could not send the verification email. Please check the address or try again later." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, verificationRequired: true });
  } catch (error) {
    console.error("Form verification request failed", error);
    const missingConfig = error instanceof Error && error.message === "Restricted form database connection is not configured.";
    return NextResponse.json({ error: missingConfig ? "Form submissions are temporarily unavailable." : "We could not process your request right now. Please try again." }, { status: missingConfig ? 503 : 500 });
  }
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "";
    const search = (searchParams.get("q") || "").trim().slice(0, 120);
    const status = searchParams.get("status") || "";
    const values: unknown[] = [];
    const where: string[] = [];
    if (type && formTypes.has(type)) { values.push(type); where.push(`form_type = $${values.length}`); }
    if (status && ["new", "reviewing", "resolved"].includes(status)) { values.push(status); where.push(`status = $${values.length}`); }
    if (search) { values.push(`%${search}%`); where.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length} OR organisation ILIKE $${values.length} OR message ILIKE $${values.length})`); }
    const result = await getFormsPool().query(
      `SELECT id, form_type, form_title, name, email, phone, organisation, location, interest, message, status, created_at
       FROM app_private.form_submissions ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 250`, values
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
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  try {
    const pool = getFormsPool();
    if (body.fields && typeof body.fields === "object") {
      const fields = body.fields as Record<string, unknown>;
      const name = clean(fields.name, 160);
      const email = clean(fields.email, 254).toLowerCase();
      if (!name || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Please provide a valid name and email address." }, { status: 400 });
      }
      const result = await pool.query(
        `UPDATE app_private.form_submissions
         SET name=$1, email=$2, phone=$3, organisation=$4, location=$5, interest=$6, message=$7, updated_at=NOW()
         WHERE id=$8 RETURNING id`,
        [name, email, clean(fields.phone,80)||null, clean(fields.organisation,180)||null,
         clean(fields.location,180)||null, clean(fields.interest,240)||null, clean(fields.message,5000)||null, id]
      );
      if (!result.rowCount) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    const status = clean(body.status, 20);
    if (!["new", "reviewing", "resolved"].includes(status)) return NextResponse.json({ error: "Invalid submission update." }, { status: 400 });
    const result = await pool.query("UPDATE app_private.form_submissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id", [status, id]);
    if (!result.rowCount) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to update form submission", error);
    return NextResponse.json({ error: "The submission could not be updated." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { id } = await request.json();
    const submissionId = clean(id, 64);
    if (!/^[0-9a-f-]{36}$/i.test(submissionId)) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    const result = await getFormsPool().query("DELETE FROM app_private.form_submissions WHERE id=$1 RETURNING id", [submissionId]);
    if (!result.rowCount) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Unable to delete form submission", error);
    return NextResponse.json({ error: "The submission could not be deleted." }, { status: 503 });
  }
}
