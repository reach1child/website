"use client";

import { useEffect } from "react";

const revealSelector = [
  ".hero", ".about-section", ".story-section", ".reach-section",
  ".get-involved", ".inner-hero", ".inner-section", ".programme-card",
  ".impact-item", ".inner-info-card", ".team-card", ".impact-detail-card",
  ".activity-item", ".story-detail-card", ".involvement-card", ".value-card",
  ".objective-item", ".partner-category", ".contact-panel"
].join(",");

export default function ScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    const register = (root: ParentNode) => {
      const elements: HTMLElement[] = [];
      if (root instanceof HTMLElement && root.matches(revealSelector)) elements.push(root);
      elements.push(...Array.from(root.querySelectorAll<HTMLElement>(revealSelector)));
      elements.forEach((element) => {
        if (element.classList.contains("scroll-reveal")) return;
        element.classList.add("scroll-reveal");
        const siblings = element.parentElement
          ? Array.from(element.parentElement.children).filter((child) => child.matches(revealSelector))
          : [];
        element.style.setProperty("--reveal-delay", `${Math.max(0, siblings.indexOf(element)) * 90}ms`);
        observer.observe(element);
      });
    };

    register(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) register(node);
      }));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
