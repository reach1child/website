"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AdminTwoFactorPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: false });
    setBusy(false);
    if (result.error) setError("That code could not be verified. Please try again.");
    else window.location.assign("/admin");
  }
  return <main className="admin-auth-page"><section className="admin-auth-card">
    <span className="admin-auth-kicker">TWO-FACTOR SECURITY</span><h1>Verify your identity</h1>
    <p>Enter the six-digit code from your authenticator app.</p>
    <form onSubmit={submit}><label htmlFor="totp-code">Authenticator code</label><input id="totp-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} required />
      {error && <p className="admin-auth-error" role="alert">{error}</p>}<button disabled={busy || code.length!==6}>{busy ? "Verifying…" : "Verify and continue"}</button>
    </form><a className="admin-auth-back" href="/admin-login">Back to sign in</a>
  </section></main>;
}
