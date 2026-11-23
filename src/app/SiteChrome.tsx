"use client";

import React from "react";
import DonateForm from "./DonateForm";

function Brand() {
  return <a className="brand" href="/" aria-label="Reach One Child Foundation home"><img src="/images/branding/logo.jpeg" alt="Reach One Child Foundation logo" /><span><strong>REACH ONE CHILD</strong><small>FOUNDATION</small></span></a>;
}

export function SiteHeader() {
  return <header className="site-header"><div className="container nav-wrap"><Brand/><details className="mobile-menu"><summary aria-label="Open navigation"><span></span><span></span><span></span></summary><nav aria-label="Mobile navigation"><a href="/">Home</a><a href="/about">About us</a><a href="/programmes">Programmes</a><a href="/impact">Our impact</a><a href="/stories">Stories</a><a href="/news">News</a><a href="/get-involved">Get involved</a><a href="/contact">Contact</a><DonateForm triggerClassName="nav-donate" triggerLabel="Donate"/></nav></details><nav className="desktop-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/about">About us</a><a href="/programmes">Programmes</a><a href="/impact">Our impact</a><a href="/stories">Stories</a><a href="/news">News</a><a href="/get-involved">Get involved</a><a href="/contact">Contact</a></nav><DonateForm triggerClassName="button button-red header-cta" triggerLabel="Donate"/></div></header>;
}

export function SiteFooter() {
  return <footer id="contact"><div className="footer-bottom"><div className="container footer-bottom-grid"><div className="footer-bottom-copy">© 2026 Reach One Child Foundation. All rights reserved.</div><div className="footer-bottom-address"><h3>Address</h3><p>3536 Mainstreet, Ibex Hill,<br/>Lusaka, Zambia</p></div><div className="footer-bottom-social"><h3>Follow us</h3><div className="social-icons"><a href="https://www.facebook.com/reach1childfoundation" target="_blank" rel="noreferrer" aria-label="Follow Reach One Child Foundation on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8z"/></svg></a><a href="https://www.instagram.com/reach1childfoundation" target="_blank" rel="noreferrer" aria-label="Follow Reach One Child Foundation on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.8" r="1" className="social-icon-fill"/></svg></a><a href="https://www.linkedin.com/company/reach-one-child-foundation" target="_blank" rel="noreferrer" aria-label="Follow Reach One Child Foundation on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9H2v13h3zM3.5 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6M22 14.2c0-3.9-2.1-5.7-4.9-5.7-2.2 0-3.2 1.2-3.8 2V9H10v13h3.3v-7.1c0-1.9.4-3.7 2.7-3.7s2.4 2.1 2.4 3.8V22H22z"/></svg></a></div></div></div></div></footer>;
}
