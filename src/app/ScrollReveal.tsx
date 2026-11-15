"use client";

import { useEffect } from "react";

const revealSelector = [
  ".hero",
  ".about-section",
  ".story-section",
  ".reach-section",
  ".get-involved",
  ".inner-hero",
  ".inner-section",
  ".programme-card",
  ".impact-item",
  ".inner-info-card",
  ".team-card",
  ".impact-detail-card",
  ".activity-item",
  ".story-detail-card",
  ".involvement-card",
  ".value-card",
  ".objective-item",
  ".partner-category",
  ".contact-panel"
].join(",");

export default function ScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("motion-ready");
    const elements = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    elements.forEach((element) => {
      element.classList.add("scroll-reveal");
      const siblings = element.parentElement
        ? Array.from(element.parentElement.children).filter((child) => child.matches(revealSelector))
        : [];
      const index = siblings.indexOf(element);
      element.style.setProperty("--reveal-delay", `${Math.max(0, index) * 90}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.classList.add("is-visible");
        observer.unobserve(element);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
