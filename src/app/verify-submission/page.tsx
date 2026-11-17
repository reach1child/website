"use client";

import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export default function VerifySubmissionPage() {
  const [token, setToken] = useState("");
  const [state, setState] = useState<"ready" | "verifying" | "success" | "error">("ready");
  const [message, setMessage] = useState("Confirm your email address to send your enquiry to Reach One Child Foundation.");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function verify() {
    if (!token) { setState("error"); setMessage("This verification link is invalid or incomplete."); return; }
    setState("verifying");
    try {
      const response = await fetch("/api/form-submissions/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Verification could not be completed.");
      setState("success");
      setMessage("Your email address has been verified and your enquiry has been successfully submitted. The R1CF team can now review it.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Verification could not be completed.");
    }
  }

  return (
    <main className="verification-page">
      <SiteHeader />
      <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "48px 20px", background: "#f6f8fc" }}>
      <section style={{ width: "100%", maxWidth: 560, background: "#fff", padding: "clamp(28px, 6vw, 52px)", borderRadius: 16, boxShadow: "0 12px 40px rgba(4,25,104,.10)", textAlign: "center" }}>
        <p style={{ color: "#EE3135", fontWeight: 700, letterSpacing: ".12em", fontSize: 12 }}>REACH ONE CHILD FOUNDATION</p>
        <h1 style={{ color: "#041968", fontSize: "clamp(26px, 4vw, 36px)", margin: "12px 0" }}>{state === "success" ? "Email verified" : state === "error" ? "Verification issue" : "Verify your email"}</h1>
        <p style={{ color: "#4b5563", lineHeight: 1.7 }}>{message}</p>
        {state === "ready" && <button type="button" onClick={verify} disabled={!token} style={{ marginTop: 24, background: "#041968", color: "#fff", border: 0, borderRadius: 6, padding: "14px 26px", fontWeight: 700, cursor: "pointer" }}>Verify email and submit enquiry</button>}
        {state === "verifying" && <p style={{ marginTop: 24, color: "#041968", fontWeight: 700 }}>Verifying…</p>}
        {state === "success" && <a href="/get-involved" style={{ display: "inline-block", marginTop: 24, color: "#041968", fontWeight: 700 }}>Return to the website</a>}
        {state === "error" && <a href="/get-involved" style={{ display: "inline-block", marginTop: 24, color: "#041968", fontWeight: 700 }}>Return and submit again</a>}
      </section>
      </div>
      <SiteFooter />
    </main>
  );
}
