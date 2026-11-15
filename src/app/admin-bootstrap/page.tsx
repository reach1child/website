"use client";

import { FormEvent, useState } from "react";

export default function AdminBootstrapPage() {
  const [token,setToken]=useState("");
  const [name,setName]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setMessage("");
    try{
      const response=await fetch("/api/admin/bootstrap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,name,password})});
      const result=await response.json();
      setMessage(result.message || (response.ok ? "Setup complete." : "Setup could not be completed."));
      if(response.ok){setToken("");setPassword("");}
    }catch{setMessage("Unable to contact the setup service. Please try again.");}
    finally{setBusy(false);}
  }
  return <main className="admin-auth-page"><section className="admin-auth-card">
    <span className="admin-auth-kicker">ONE-TIME SECURE SETUP</span><h1>Create the first administrator</h1>
    <p>This private setup is available only before the first administrator account exists. Use the one-time token supplied by the foundation’s system administrator.</p>
    <form onSubmit={submit}><label htmlFor="bootstrap-token">One-time setup token</label><input id="bootstrap-token" type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} required />
      <label htmlFor="bootstrap-name">Administrator name</label><input id="bootstrap-name" value={name} onChange={e=>setName(e.target.value)} required />
      <label htmlFor="bootstrap-password">Create a strong password</label><input id="bootstrap-password" type="password" autoComplete="new-password" minLength={14} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required />
      <button disabled={busy}>{busy?"Creating account…":"Create administrator account"}</button>
    </form>{message&&<p className="admin-auth-message" role="status">{message}</p>}
    <a className="admin-auth-back" href="/">Return to website</a>
  </section></main>;
}
