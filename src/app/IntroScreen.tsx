"use client";

import { useEffect, useState } from "react";

export default function IntroScreen() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const key = "r1cf-intro-seen";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (sessionStorage.getItem(key) || reduceMotion) {
      setVisible(false);
      return;
    }

    sessionStorage.setItem(key, "1");
    const exitTimer = window.setTimeout(() => setExiting(true), 5500);
    const removeTimer = window.setTimeout(() => setVisible(false), 6000);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`intro-screen${exiting ? " intro-screen-exit" : ""}`} role="status" aria-label="Reach One Child Foundation">
      <div className="intro-content">
        <img className="intro-logo" src="/images/branding/logo.jpeg" alt="Reach One Child Foundation" />
        <div className="intro-name">REACH ONE CHILD FOUNDATION</div>
        <p>For Every Child, Education.</p>
        <span className="intro-pulse-line" aria-hidden="true"><i /></span>
      </div>
      <button className="intro-skip" type="button" onClick={() => { setExiting(true); window.setTimeout(() => setVisible(false), 500); }}>Skip intro <span aria-hidden="true">→</span></button>
    </div>
  );
}
