import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, dbPool } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const formTypes = new Set(["sponsor", "partner", "volunteer", "general"]);
const clean = (value: unknown, max = 2000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.email.toLowerCase() !== "r1cfprojects@gmail.com" ||
      session.user.role !== "admin" || !session.user.twoFactorEnabled) return null;
  return session;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formType = clean(body.formType, 32);
    const formTitle = clean(body.formTitle, 120);
    const name = clean(body.name, 160);
    const email = clean(body.email, 254).toLowerCase();
    if (!formTypes.has(formType) || !formTitle || !name ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
    }
    const result = await dbPool.query(
      `INSERT INTO public.form_submissions
       (form_type, form_title, name, email, phone, organisation, location, interest, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [formType, formTitle, name, email, clean(body.phone, 80) || null,
       clean(body.organisation, 180) || null, clean(body.location, 180) || null,
       clean(body.interest, 240) || null, clean(body.message, 5000) || null]
    );
    return NextResponse.json({ ok: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Form submission failed", error);
    return NextResponse.json({ error: "We could not submit your form right now. Please try again." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
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
  const result = await dbPool.query(
    `SELECT id, form_type, form_title, name, email, phone, organisation, location, interest, message, status, created_at
     FROM public.form_submissions ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY created_at DESC LIMIT 250`, values
  );
  return NextResponse.json({ submissions: result.rows });
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
  const result = await dbPool.query(
    "UPDATE public.form_submissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id",
    [status, id]
  );
  if (!result.rowCount) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
