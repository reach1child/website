import { betterAuth } from "better-auth";
import { admin, twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 8_000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

async function sendTransactionalEmail(to: string, subject: string, text: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) throw new Error("Transactional email is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to send authentication email.");
}

export const auth = betterAuth({
  appName: "Reach One Child Foundation Administration",
  baseURL: process.env.BETTER_AUTH_URL || "https://reachonechildfoundation.org",
  secret: process.env.BETTER_AUTH_SECRET,
  database: dbPool,
  trustedOrigins: ["https://reachonechildfoundation.org"],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 14,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail(
        user.email,
        "Reset your R1CF administrator password",
        `Use this secure link to reset your password: ${url}\n\nIf you did not request this, you can ignore this email.`,
        `<p>Use the secure link below to reset your password.</p><p><a href="${url}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
      );
    },
  },
  session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 60, cookieCache: { enabled: true, maxAge: 60 } },
  rateLimit: { enabled: true, window: 60, max: 10 },
  plugins: [
    admin(),
    twoFactor({ issuer: "Reach One Child Foundation", backupCodeOptions: { storeBackupCodes: "encrypted" } }),
    nextCookies(),
  ],
});
