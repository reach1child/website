"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { authClient } from "@/lib/auth-client";

export default function AdminTwoFactorSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function begin(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const result = await authClient.twoFactor.enable({ password, method: "totp" });
    setBusy(false);
    if (result.error || !result.data) {
      setError("Could not start authenticator setup. Check your password and try again.");
    } else if (result.data.method !== "totp") {
      setError("The authenticator setup did not return a TOTP configuration. Please try again.");
    } else {
      setTotpURI(result.data.totpURI);
      setBackupCodes(result.data.backupCodes || []);
    }
  }
  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: false });
    setBusy(false);
    if (result.error) setError("The code was not accepted. Check your authenticator and try again.");
    else router.replace("/admin/dashboard");
  }

  return <main className="admin-auth-page"><section className="admin-auth-card admin-auth-wide">
    <span className="admin-auth-kicker">REQUIRED ACCOUNT PROTECTION</span><h1>Set up your authenticator</h1>
    {!totpURI ? <>
      <p>Before entering the administration workspace, protect your account with an authenticator app such as Google Authenticator or Microsoft Authenticator.</p>
      <form onSubmit={begin}><label htmlFor="setup-password">Confirm your administrator password</label><input id="setup-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /><button disabled={busy}>{busy ? "Preparing…" : "Set up two-factor authentication"}</button></form>
    </> : <>
      <p>Scan this QR code with your authenticator app, then enter the six-digit code it generates.</p>
      <div className="admin-auth-qr"><QRCodeSVG value={totpURI} size={190} /></div>
      <p className="admin-auth-small">If you cannot scan the QR code, copy this setup URI into your authenticator app:</p><code className="admin-auth-uri">{totpURI}</code>
      {backupCodes.length>0 && <div className="admin-backup-codes"><strong>Save these recovery codes somewhere secure.</strong><div>{backupCodes.map(item=><code key={item}>{item}</code>)}</div></div>}
      <form onSubmit={verify}><label htmlFor="setup-code">Authenticator verification code</label><input id="setup-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} required /><button disabled={busy || code.length!==6}>{busy ? "Verifying…" : "Verify and secure account"}</button></form>
    </>}
    {error && <p className="admin-auth-error" role="alert">{error}</p>}
    <a className="admin-auth-back" href="/admin-login">Sign out</a>
  </section></main>;
}
