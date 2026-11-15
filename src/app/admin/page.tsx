"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setLoading(false); return; }
    const exit = window.setTimeout(() => setExiting(true), 5500);
    const remove = window.setTimeout(() => setLoading(false), 6000);
    return () => { window.clearTimeout(exit); window.clearTimeout(remove); };
  }, []);

  return <>
    {loading && <div className={`admin-intro-screen${exiting ? " admin-intro-exit" : ""}`} role="status" aria-label="Reach One Child Foundation administration">
      <div className="admin-intro-content">
        <img src="/images/branding/logo.jpeg" alt="Reach One Child Foundation" />
        <strong>REACH ONE CHILD FOUNDATION</strong>
        <span>ADMINISTRATION PORTAL</span>
        <i><b /></i>
      </div>
      <button type="button" onClick={() => { setExiting(true); window.setTimeout(() => setLoading(false), 500); }}>Skip intro <span>→</span></button>
    </div>}
    <main className="admin-portal">
      <header className="admin-topbar">
        <Link href="/" className="admin-brand"><img src="/images/branding/logo.jpeg" alt="" /><span><strong>REACH ONE CHILD</strong><small>FOUNDATION · ADMIN</small></span></Link>
        <div className="admin-topbar-right"><span className="admin-status-dot" /> <span>Administration portal</span><Link href="/">View website <b>↗</b></Link></div>
      </header>
      <section className="admin-welcome">
        <div className="admin-welcome-copy"><span className="admin-eyebrow">REACH ONE CHILD FOUNDATION</span><h1>Good work starts <em>with good management.</em></h1><p>Welcome to your administration space. Choose where you would like to work today.</p></div>
        <div className="admin-welcome-mark"><span>R1CF</span><small>EDUCATE · EMPOWER · TRANSFORM</small></div>
      </section>
      <section className="admin-workspaces">
        <div className="admin-section-heading"><div><span className="admin-eyebrow">YOUR WORKSPACE</span><h2>Where would you like to go?</h2></div><p>Two connected spaces. One shared mission.</p></div>
        <div className="admin-card-grid">
          <Link href="/admin/dashboard" className="admin-work-card admin-dashboard-card">
            <div className="admin-card-top"><span className="admin-card-icon">▦</span><span className="admin-card-number">01 / OPERATIONS</span></div>
            <div className="admin-card-content"><span className="admin-card-kicker">MANAGE THE FOUNDATION</span><h3>Dashboard</h3><p>Your central command centre for the work of R1CF. Monitor activity, manage enquiries and volunteers, and keep programme reporting organised.</p>
              <ul><li>Analytics & impact overview</li><li>Forms & enquiry management</li><li>Volunteer management</li><li>Activities & reports</li></ul>
            </div>
            <div className="admin-card-footer"><strong>Open Dashboard</strong><span>↗</span></div>
          </Link>
          <Link href="/admin/cms" className="admin-work-card admin-cms-card">
            <div className="admin-card-top"><span className="admin-card-icon">✎</span><span className="admin-card-number">02 / WEBSITE</span></div>
            <div className="admin-card-content"><span className="admin-card-kicker">MANAGE YOUR ONLINE PRESENCE</span><h3>Content Management <em>System</em></h3><p>A WordPress-inspired editing workspace to manage website pages, images, news, programmes and the content visitors see.</p>
              <ul><li>Pages & page layouts</li><li>News, stories & activities</li><li>Media library</li><li>Menus & website settings</li></ul>
            </div>
            <div className="admin-card-footer"><strong>Open CMS</strong><span>↗</span></div>
          </Link>
        </div>
      </section>
      <footer className="admin-footer"><span>© {new Date().getFullYear()} Reach One Child Foundation</span><span>FOR EVERY CHILD, EDUCATION.</span><Link href="/">Back to public website ↗</Link></footer>
    </main>
  </>;
}
