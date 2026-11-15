"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function AdminBrand() {
  return <Link className="brand" href="/" aria-label="Reach One Child Foundation home"><img src="/images/branding/logo.jpeg" alt="Reach One Child Foundation logo" /><span><strong>REACH ONE CHILD</strong><small>FOUNDATION</small></span></Link>;
}

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
    <main id="admin-home">
      <header className="site-header">
        <div className="container nav-wrap">
          <AdminBrand />
          <details className="mobile-menu">
            <summary aria-label="Open navigation"><span></span><span></span><span></span></summary>
            <nav aria-label="Mobile navigation"><Link href="/">Home</Link><Link href="/about">About us</Link><Link href="/programmes">Programmes</Link><Link href="/impact">Our impact</Link><Link href="/stories">Stories</Link><Link href="/news">News</Link><Link href="/get-involved">Get involved</Link><Link href="/contact">Contact</Link><Link className="nav-donate" href="/admin">Admin portal</Link></nav>
          </details>
          <nav className="desktop-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/about">About us</Link><Link href="/programmes">Programmes</Link><Link href="/impact">Our impact</Link><Link href="/stories">Stories</Link><Link href="/news">News</Link><Link href="/get-involved">Get involved</Link><Link href="/contact">Contact</Link></nav>
          <Link className="button button-red header-cta" href="/admin">Admin portal</Link>
        </div>
      </header>
      <section className="admin-workspaces">
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
      <footer id="contact">
        <div className="footer-bottom">
          <div className="container footer-bottom-grid">
            <div className="footer-bottom-copy">© {new Date().getFullYear()} Reach One Child Foundation. All rights reserved.</div>
            <div className="footer-bottom-address"><h3>Address</h3><p>Suite 2103/4/5, Room 301,<br/>Nairobi Place, Wood Gate House,<br/>Lusaka, Zambia</p></div>
            <div className="footer-bottom-social"><h3>Follow us</h3><div className="social-icons">
              <a href="https://www.facebook.com/reach1childfoundation" target="_blank" rel="noreferrer" aria-label="Follow Reach One Child Foundation on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8z"/></svg></a>
              <a href="https://www.instagram.com/reach1childfoundation" target="_blank" rel="noreferrer" aria-label="Follow Reach One Child Foundation on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.8" r="1" className="social-icon-fill"/></svg></a>
              <a href="https://www.linkedin.com/company/reach-one-child-foundation" target="_blank" rel="noreferrer" aria-label="Follow Reach One Child Foundation on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9H2v13h3zM3.5 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6M22 14.2c0-3.9-2.1-5.7-4.9-5.7-2.2 0-3.2 1.2-3.8 2V9H10v13h3.3v-7.1c0-1.9.4-3.7 2.7-3.7s2.4 2.1 2.4 3.8V22H22z"/></svg></a>
            </div></div>
          </div>
        </div>
      </footer>
    </main>
  </>;
}
