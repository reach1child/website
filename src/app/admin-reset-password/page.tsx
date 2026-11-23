"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AdminResetPasswordPage() {
  const router=useRouter();
  const [token,setToken]=useState("");
  useEffect(()=>{setToken(new URLSearchParams(window.location.search).get("token")||"");},[]);
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent){
    event.preventDefault();setError("");
    if(!token){setError("This password setup link is missing or has expired. Ask an administrator to send a new invitation.");return;}
    if(password.length<14){setError("Choose a password with at least 14 characters.");return;}
    if(password!==confirm){setError("The passwords do not match.");return;}
    setBusy(true);
    const result=await authClient.resetPassword({newPassword:password,token});
    setBusy(false);
    if(result.error){setError("This link may have expired or already been used. Ask an administrator to send a new password link.");return;}
    router.replace("/admin-login?password=updated");
  }
  return <main className="admin-auth-page"><section className="admin-auth-card">
    <img src="/images/branding/logo.jpeg" alt="Reach One Child Foundation"/>
    <span className="admin-auth-kicker">SECURE STAFF ACCESS</span>
    <h1>Set your password</h1>
    <p>Choose a strong password to access the Reach One Child Foundation content workspace.</p>
    <form onSubmit={submit}>
      <label htmlFor="new-password">New password</label>
      <input id="new-password" type="password" autoComplete="new-password" minLength={14} value={password} onChange={e=>setPassword(e.target.value)} required/>
      <label htmlFor="confirm-password">Confirm password</label>
      <input id="confirm-password" type="password" autoComplete="new-password" minLength={14} value={confirm} onChange={e=>setConfirm(e.target.value)} required/>
      {error&&<p className="admin-auth-error" role="alert">{error}</p>}
      <button disabled={busy}>{busy?"Saving…":"Set password securely"}</button>
    </form>
    <a className="admin-auth-back" href="/admin-login">Return to sign in</a>
  </section></main>;
}
