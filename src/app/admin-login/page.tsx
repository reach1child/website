"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("r1cfprojects@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    const result = await authClient.signIn.email({ email, password, callbackURL: "/admin/dashboard" });
    setBusy(false);
    if (result.error) setError("Sign-in failed. Check your details and try again.");
    else router.replace("/admin/dashboard");
  }

  return <main className="admin-auth-page"><section className="admin-auth-card">
    <img src="/images/branding/logo.jpeg" alt="Reach One Child Foundation" />
    <span className="admin-auth-kicker">SECURE ADMINISTRATION</span>
    <h1>Administrator sign in</h1>
    <p>Sign in to access the foundation’s administration workspace.</p>
    <form onSubmit={submit}>
      <label htmlFor="admin-email">Email address</label>
      <input id="admin-email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required />
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required />
      {error && <p className="admin-auth-error" role="alert">{error}</p>}
      <button disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button>
    </form>
    <a className="admin-auth-back" href="/">Return to website</a>
  </section></main>;
}
